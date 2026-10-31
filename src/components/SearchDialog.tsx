import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Tags, Dumbbell, FolderKanban, NotebookPen, CornerDownLeft } from 'lucide-react';
import { search, type ResultKind } from '../lib/search';
import { useProgress } from '../lib/progress';

const ICON: Record<ResultKind, typeof Search> = { lesson: BookOpen, term: Tags, exercise: Dumbbell, project: FolderKanban, note: NotebookPen };
const SUGGESTIONS = ['groupby', 'p-value', 'JOIN', 'overfitting', 'missing values', 'gradient descent'];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const { state } = useProgress();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const results = useMemo(() => search(q, state.notes), [q, state.notes]);

  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => input.current?.select(), 0);
    }
  }, [open]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;
  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) go(results[active].to);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[10vh]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search" className="card w-full max-w-xl overflow-hidden !p-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            ref={input}
            className="w-full bg-transparent py-3.5 text-sm outline-none"
            placeholder="Search lessons, terms, exercises, projects and your notes…"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results.length ? `search-r${active}` : undefined}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <kbd className="hidden rounded border border-slate-300 px-1.5 text-[10px] text-slate-400 sm:block dark:border-slate-700">Esc</kbd>
        </div>
        {q.trim() === '' ? (
          <div className="p-4 text-sm text-slate-500">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Try</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => <button key={s} className="chip bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800" onClick={() => setQ(s)}>{s}</button>)}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No results for “{q}”. Try a shorter or different word.</p>
        ) : (
          <ul ref={list} id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((r, i) => {
              const Icon = ICON[r.kind];
              return (
                <li key={r.kind + r.to + r.title} id={`search-r${i}`} data-i={i} role="option" aria-selected={i === active}>
                  <button
                    className={`flex w-full gap-3 px-4 py-2.5 text-left ${i === active ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(r.to)}
                  >
                    <Icon size={17} className="mt-0.5 shrink-0 text-indigo-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{r.title}</span>
                      <span className="block truncate text-xs text-slate-500">{r.subtitle}</span>
                      {r.snippet && <span className="mt-0.5 line-clamp-2 block text-xs text-slate-400">{r.snippet}</span>}
                    </span>
                    {i === active && <CornerDownLeft size={14} className="mt-1 shrink-0 text-slate-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
