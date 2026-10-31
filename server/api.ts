import type { IncomingMessage, ServerResponse } from 'node:http';
import Anthropic from '@anthropic-ai/sdk';

// The API key is read from the server environment only. It is never sent to the browser.
const MODEL = process.env.TUTOR_MODEL || 'claude-opus-5-5';
const EFFORT = (process.env.TUTOR_EFFORT || 'medium') as 'low' | 'medium' | 'high';

const MAX_MESSAGES = 30;
const MAX_CHARS_PER_MESSAGE = 12_000;
const RATE_LIMIT_PER_MINUTE = 20;

const MODES: Record<string, string> = {
  explain: 'Explain the concept clearly, starting from first principles.',
  simpler:
    'The learner found the previous explanation too hard. Re-explain using everyday language, a concrete analogy, and no jargon (define any term you must use).',
  'step-by-step':
    'Walk through the code or problem one step (or line) at a time. For each step say what it does and why.',
  examples: 'Give two or three additional, varied, concrete examples, each with a short explanation.',
  hint:
    'Give ONLY a hint that moves the learner one step forward. Do NOT reveal the full solution or final code. Ask a guiding question at the end.',
  debug:
    'Help debug the code. First explain what the error message means in plain words, then point to the line(s) causing it, then suggest how to fix it. Prefer guiding the learner to the fix over pasting a full rewritten program.',
  review:
    'The learner answered a quiz question incorrectly. Explain why their answer is wrong, why the correct answer is right, and the underlying concept, kindly.',
  practice:
    'Generate 3 new practice questions on the topic with increasing difficulty. Put the answers and short explanations in a separate section at the very end under the heading "Answers" so the learner can try first.',
};

const SYSTEM_PROMPT = `You are the AI Tutor inside "DataScience Academy", an interactive course that takes complete beginners to job-ready Data Science skills (Python, math, statistics, pandas, visualization, SQL, BI, machine learning).

Teach like a patient, encouraging university professor:
- Never make the learner feel stupid; basic questions are welcome.
- Explain technical terms in simple language the first time you use them. Use analogies when they help.
- Break complicated problems into small steps. Encourage the learner to try the next step themselves.
- Never give an answer without explaining the reasoning.
- When asked for a hint, give a hint, not the solution.
- Code must be valid, runnable Python 3 (or standard SQL / SQLite for SQL questions). Keep examples short.
- The learner's in-browser environment runs Python 3.13 via Pyodide with numpy, pandas, matplotlib, seaborn and scikit-learn; datasets live in the folder data/ (e.g. data/sales.csv). TensorFlow/PyTorch are not available in the browser.
- Format answers in Markdown. Use fenced code blocks with a language tag. Use $...$ for inline math and $$...$$ for display math.
- Be accurate. If you are not sure, say so.
- Stay on topics related to learning data science, programming, math and statistics, and careers in data. Politely redirect other requests.`;

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_PER_MINUTE;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage, limit = 400_000): Promise<string> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('Request body too large');
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function validateMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('messages must be a non-empty array');
  const msgs = raw.slice(-MAX_MESSAGES).map((m) => {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string')
      throw new Error('each message needs role "user" | "assistant" and string content');
    return { role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MESSAGE) } as ChatMessage;
  });
  // The API requires the conversation to start with a user turn.
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') throw new Error('last message must be from the user');
  return msgs;
}

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

async function handleTutor(req: IncomingMessage, res: ServerResponse) {
  const anthropic = getClient();
  if (!anthropic) {
    return sendJson(res, 503, {
      error: 'The AI tutor is not configured. Add ANTHROPIC_API_KEY to the .env file and restart the server.',
    });
  }
  const ip = req.socket.remoteAddress || 'local';
  if (rateLimited(ip)) return sendJson(res, 429, { error: 'Too many requests. Please wait a minute and try again.' });

  let messages: ChatMessage[];
  let mode = 'explain';
  let context = '';
  try {
    const body = JSON.parse(await readBody(req));
    messages = validateMessages(body.messages);
    if (typeof body.mode === 'string' && MODES[body.mode]) mode = body.mode;
    if (typeof body.context === 'string') context = body.context.slice(0, 6000);
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }

  const system = [
    SYSTEM_PROMPT,
    `Current tutoring mode: ${MODES[mode]}`,
    context ? `What the learner is currently studying (for context):\n${context}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  const abort = new AbortController();
  res.on('close', () => abort.abort());

  try {
    const stream = anthropic.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 8000,
        system,
        messages,
        output_config: { effort: EFFORT },
        // Re-run on Anthropic's recommended fallback model if the request is declined.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      },
      { signal: abort.signal },
    );
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') res.write(event.delta.text);
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      res.write('\n\n_I can’t help with that request. Try rephrasing it as a data science learning question._');
    } else if (final.stop_reason === 'max_tokens') {
      res.write('\n\n_(Answer truncated — ask me to continue.)_');
    }
    res.end();
  } catch (e) {
    if (abort.signal.aborted) return;
    let msg = 'The tutor could not respond. Please try again.';
    if (e instanceof Anthropic.AuthenticationError) msg = 'The API key was rejected. Check ANTHROPIC_API_KEY in .env.';
    else if (e instanceof Anthropic.RateLimitError) msg = 'The AI service is rate-limiting requests. Wait a moment and retry.';
    else if (e instanceof Anthropic.APIConnectionError) msg = 'Could not reach the AI service. Check your internet connection.';
    else if (e instanceof Anthropic.APIError) msg = `AI service error: ${e.message}`;
    console.error('[tutor]', e);
    res.write(`\n\n[[TUTOR_ERROR]] ${msg}`);
    res.end();
  }
}

export async function handleApi(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/api/tutor/status' && req.method === 'GET') {
    return sendJson(res, 200, { configured: Boolean(process.env.ANTHROPIC_API_KEY), model: MODEL });
  }
  if (url.pathname === '/api/tutor' && req.method === 'POST') return handleTutor(req, res);
  return sendJson(res, 404, { error: 'Not found' });
}
