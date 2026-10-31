// Client-side full-text search over lessons, glossary terms, exercises, projects and the learner's notes.
import { MODULES, PROJECTS, lessonPath } from '../content';

export type ResultKind = 'lesson' | 'term' | 'exercise' | 'project' | 'note';

export interface SearchResult {
  kind: ResultKind;
  title: string;
  subtitle: string;
  to: string;
  snippet?: string;
  score: number;
}

interface Doc {
  kind: ResultKind;
  title: string;
  subtitle: string;
  to: string;
  /** [text, weight] — a title match counts far more than a match in body text. */
  fields: [string, number][];
}

// Strip markdown/LaTeX noise so snippets read as plain text.
const plain = (s: string) =>
  s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$?[^$]*\$\$?/g, ' ')
    .replace(/[`*_#>|[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

let docs: Doc[] | null = null;
function index(): Doc[] {
  if (docs) return docs;
  docs = [];
  for (const m of MODULES) {
    for (const l of m.lessons) {
      const where = `Module ${m.number}: ${m.title}`;
      docs.push({
        kind: 'lesson',
        title: l.title,
        subtitle: where,
        to: lessonPath(l.id),
        fields: [
          [l.title, 10],
          [l.terms.map((t) => t[0]).join(' · '), 5],
          [l.objectives.join(' '), 3],
          [l.summary.map(plain).join(' '), 3],
          [plain(`${l.intro} ${l.simple} ${l.technical} ${l.realWorld}`), 1],
        ],
      });
      for (const [term, def] of l.terms) {
        docs.push({ kind: 'term', title: term, subtitle: `Key term · ${l.title}`, to: `${lessonPath(l.id)}#terms`, fields: [[term, 10], [plain(def), 2]] });
      }
      for (const e of l.exercises) {
        docs.push({ kind: 'exercise', title: e.title, subtitle: `Exercise · ${l.title}`, to: `${lessonPath(l.id)}#exercises`, fields: [[e.title, 8], [plain(e.prompt), 2]] });
      }
    }
  }
  for (const p of PROJECTS) {
    docs.push({
      kind: 'project',
      title: p.title,
      subtitle: `${p.level} project · ${p.hours} h`,
      to: `/projects/${p.id}`,
      fields: [[p.title, 10], [p.skills.join(' '), 4], [p.libraries.join(' '), 3], [plain(p.businessProblem), 1]],
    });
  }
  return docs;
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter((w) => w.length > 0);

function snippetFor(text: string, w: string) {
  const i = text.toLowerCase().indexOf(w);
  if (i < 0) return undefined;
  const start = Math.max(0, i - 50);
  return (start > 0 ? '…' : '') + text.slice(start, i + 90).trim() + (i + 90 < text.length ? '…' : '');
}

function score(doc: Pick<Doc, 'fields'>, ws: string[]): { score: number; snippet?: string } | null {
  let total = 0;
  for (const w of ws) {
    let best = 0;
    for (const [text, weight] of doc.fields) {
      const t = text.toLowerCase();
      const i = t.indexOf(w);
      if (i < 0) continue;
      // Whole-word and prefix matches beat matches in the middle of a word.
      const atStart = i === 0 || !/[a-z0-9]/.test(t[i - 1]);
      best = Math.max(best, weight * (atStart ? 2 : 1));
    }
    if (!best) return null; // every word must match somewhere
    total += best;
  }
  const body = doc.fields.at(-1)![0];
  return { score: total, snippet: ws.map((w) => snippetFor(body, w)).find(Boolean) };
}

export function search(query: string, notes: Record<string, string> = {}, limit = 30): SearchResult[] {
  const ws = words(query);
  if (!ws.length) return [];
  const out: SearchResult[] = [];
  for (const d of index()) {
    const s = score(d, ws);
    if (s) out.push({ kind: d.kind, title: d.title, subtitle: d.subtitle, to: d.to, snippet: d.kind === 'lesson' ? s.snippet : undefined, score: s.score });
  }
  for (const [lessonId, text] of Object.entries(notes)) {
    const s = score({ fields: [[text, 6]] }, ws);
    const l = MODULES.flatMap((m) => m.lessons).find((x) => x.id === lessonId);
    if (s && l) out.push({ kind: 'note', title: `Your note · ${l.title}`, subtitle: 'My notes', to: `${lessonPath(l.id)}#notes`, snippet: snippetFor(text, ws[0]) ?? text.slice(0, 120), score: s.score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
