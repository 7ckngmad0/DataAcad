import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Square, Trash2, Bot, User, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { Markdown } from '../components/Markdown';
import { PageHeader } from '../components/ui';

type Msg = { role: 'user' | 'assistant'; content: string; error?: boolean };

const MODES = [
  ['explain', 'Explain', 'Clear explanation from first principles'],
  ['simpler', 'Simpler please', 'Plain language + analogy, no jargon'],
  ['step-by-step', 'Step by step', 'Walk through code or a problem line by line'],
  ['examples', 'More examples', 'Extra worked examples'],
  ['hint', 'Hint only', 'A nudge — no full solution'],
  ['debug', 'Debug my code', 'Explain the error and how to fix it'],
  ['review', 'Review my answer', 'Why a quiz answer was wrong'],
  ['practice', 'Practice questions', 'Generate new questions (answers at the end)'],
] as const;

const SUGGESTIONS = [
  'What is the difference between a list and a tuple in Python?',
  'Explain standard deviation like I am 12 years old.',
  'Why do we split data into training and test sets?',
  'What does a p-value of 0.03 actually mean?',
  'When should I use a LEFT JOIN instead of an INNER JOIN?',
];

const HISTORY_KEY = 'dsa-tutor-history';

export function Tutor() {
  const loc = useLocation();
  const navigate = useNavigate();
  const incoming = loc.state as { prompt?: string; mode?: string; context?: string } | null;
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState(incoming?.prompt ?? '');
  const [mode, setMode] = useState<string>(incoming?.mode ?? 'explain');
  const [context, setContext] = useState(incoming?.context ?? '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; model?: string } | null>(null);
  const [statusError, setStatusError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/tutor/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatusError(true));
  }, []);
  useEffect(() => {
    if (incoming) {
      navigate('.', { replace: true, state: null }); // consume the hand-off
      inputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.filter((m) => !m.error).slice(-40)));
    } catch {
      /* ignore */
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || busy) return;
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: 'user', content }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), mode, context }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
        throw new Error(err.error);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const errAt = acc.indexOf('[[TUTOR_ERROR]]');
        if (errAt >= 0) {
          const msg = acc.slice(errAt + 15).trim();
          acc = acc.slice(0, errAt).trim();
          setMessages([...history, ...(acc ? [{ role: 'assistant' as const, content: acc }] : []), { role: 'assistant', content: msg, error: true }]);
          return;
        }
        setMessages([...history, { role: 'assistant', content: acc }]);
      }
    } catch (e) {
      if (ctrl.signal.aborted) {
        setMessages((ms) => {
          const last = ms[ms.length - 1];
          return last?.content ? ms : ms.slice(0, -1);
        });
      } else {
        setMessages([...history, { role: 'assistant', content: (e as Error).message || 'Could not reach the tutor.', error: true }]);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const notConfigured = statusError || (status && !status.configured);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-5rem)]">
      <PageHeader title="AI Tutor" subtitle="A patient professor for any Data Science question — explanations, hints, debugging help and practice questions.">
        {messages.length > 0 && (
          <button className="btn-ghost" onClick={() => { if (confirm('Clear the conversation?')) setMessages([]); }}>
            <Trash2 size={16} /> New conversation
          </button>
        )}
      </PageHeader>

      {notConfigured && (
        <div className="card mb-4 flex gap-3 border-amber-300 p-4 text-sm dark:border-amber-800">
          <KeyRound className="shrink-0 text-amber-500" />
          <div>
            <div className="font-semibold">The AI tutor needs an API key (it is not connected yet).</div>
            {statusError ? (
              <p className="mt-1 text-slate-600 dark:text-slate-400">The tutor server could not be reached. Start the app with <code>npm run dev</code> (development) or <code>npm start</code> (after <code>npm run build</code>).</p>
            ) : (
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-600 dark:text-slate-400">
                <li>Create an API key at <a className="text-indigo-600 underline" href="https://console.anthropic.com/" target="_blank" rel="noreferrer">console.anthropic.com</a>.</li>
                <li>Copy <code>.env.example</code> to <code>.env</code> in the project folder and set <code>ANTHROPIC_API_KEY=…</code></li>
                <li>Restart the server. The key stays on the server and is never sent to your browser.</li>
              </ol>
            )}
            <p className="mt-1 text-slate-500">Everything else in the app works without it.</p>
          </div>
        </div>
      )}

      <div className="card flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-xl py-6 text-center">
              <Bot size={40} className="mx-auto text-indigo-500" />
              <h2 className="mt-3 text-lg font-semibold">Ask me anything about Data Science</h2>
              <p className="mt-1 text-sm text-slate-500">No question is too basic. Pick a mode below to change how I help.</p>
              <div className="mt-5 grid gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-indigo-400 dark:border-slate-700" onClick={() => setInput(s)} disabled={!!notConfigured}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-600 text-white'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : m.error ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {m.error && <AlertCircle size={16} className="mb-1" />}
                {m.role === 'user' ? <div className="whitespace-pre-wrap">{m.content}</div> : m.content ? <Markdown>{m.content}</Markdown> : <Loader2 size={16} className="animate-spin" />}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {MODES.map(([id, label, desc]) => (
              <button key={id} title={desc} onClick={() => setMode(id)} className={`chip shrink-0 cursor-pointer border py-1 ${mode === id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
          {context && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:bg-slate-800/60">
              <span className="truncate">Context: {context.split('\n').slice(0, 2).join(' · ')}</span>
              <button className="ml-auto shrink-0 hover:text-rose-600" onClick={() => setContext('')}>Remove</button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              className="input min-h-[44px] resize-none"
              rows={Math.min(8, Math.max(1, input.split('\n').length))}
              placeholder={notConfigured ? 'Tutor not configured — see the instructions above.' : 'Ask a question… (Enter to send, Shift+Enter for a new line)'}
              value={input}
              disabled={!!notConfigured}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            {busy ? (
              <button className="btn-secondary" onClick={() => abortRef.current?.abort()} aria-label="Stop"><Square size={16} /></button>
            ) : (
              <button className="btn-primary" onClick={() => send()} disabled={!input.trim() || !!notConfigured} aria-label="Send"><Send size={16} /></button>
            )}
          </div>
          {status?.configured && <div className="mt-1 text-[11px] text-slate-400">Model: {status.model} · AI answers can contain mistakes — verify important facts by running the code.</div>}
        </div>
      </div>
    </div>
  );
}
