import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Square, Keyboard, Loader2, Database as DbIcon } from 'lucide-react';
import type { Database } from 'sql.js';
import { CodeEditor } from './CodeEditor';
import { OutputPanel, SqlTable } from './Output';
import { restartPython, runPython, usePythonStatus, type OutputItem, type RunResult } from '../lib/python';
import { openDb, runSql, type SqlResult } from '../lib/sql';
import type { Lang } from '../types';

export function PythonStatusBadge() {
  const st = usePythonStatus();
  const label =
    st.status === 'idle' ? 'Python not loaded' : st.status === 'loading' ? st.detail || 'Loading Python…' : st.status === 'packages' ? st.detail || 'Loading packages…' : st.status === 'running' ? 'Running…' : st.status === 'error' ? 'Python error' : 'Python ready';
  const color = st.status === 'ready' ? 'bg-emerald-500' : st.status === 'error' ? 'bg-rose-500' : st.status === 'idle' ? 'bg-slate-400' : 'bg-amber-500 animate-pulse';
  return (
    <span className="inline-flex max-w-[240px] items-center gap-1.5 truncate text-xs text-slate-500" title={st.detail}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} /> <span className="truncate">{label}</span>
    </span>
  );
}

interface Props {
  code: string;
  lang?: Lang;
  db?: string;
  title?: string;
  /** Python: assertions to run after the code (exercise checking). */
  tests?: string;
  namespace?: string;
  onResult?: (r: RunResult) => void;
  onCodeChange?: (code: string) => void;
  extraButtons?: React.ReactNode;
  minHeight?: string;
  showStdin?: boolean;
  /** What the reset button restores (defaults to the initial code). */
  resetCode?: string;
  /**
   * SQL: keep data changes (INSERT/CREATE…) between runs, as in the playground. By default each
   * run starts from a fresh database, so lesson examples and exercises can be re-run and behave
   * exactly like the answer checker.
   */
  persistDb?: boolean;
}

export function CodeRunner({ code: initial, lang = 'python', db = 'shop', title, namespace, onResult, onCodeChange, extraButtons, minHeight, showStdin, resetCode, persistDb }: Props) {
  const [code, setCode] = useState(initial);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [stdin, setStdin] = useState('');
  const [stdinOpen, setStdinOpen] = useState(!!showStdin);
  const [sqlResults, setSqlResults] = useState<SqlResult[] | null>(null);
  const [sqlMsg, setSqlMsg] = useState<string | null>(null);
  const dbRef = useRef<Database | null>(null);
  const st = usePythonStatus();

  useEffect(() => setCode(initial), [initial]);
  useEffect(() => () => dbRef.current?.close(), []);

  const change = (v: string) => {
    setCode(v);
    onCodeChange?.(v);
  };

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    if (lang === 'sql') {
      try {
        if (!persistDb) {
          dbRef.current?.close();
          dbRef.current = null;
        }
        dbRef.current ??= await openDb(db);
        const r = runSql(dbRef.current, code);
        setSqlResults(r.results);
        setSqlMsg(r.error ? `Error: ${r.error}` : r.results.length ? null : `Statement executed. ${r.changes} row(s) changed.`);
      } catch (e) {
        setSqlMsg(`Could not load SQLite: ${(e as Error).message}`);
      }
      setRunning(false);
      return;
    }
    setOutput([]);
    const items: OutputItem[] = [];
    const r = await runPython(code, { stdin: stdinOpen ? stdin : undefined, namespace, onOutput: (o) => { items.push(o); setOutput([...items]); } });
    setOutput(r.output);
    setRunning(false);
    onResult?.(r);
  }, [running, lang, db, code, stdin, stdinOpen, namespace, onResult, persistDb]);

  const resetDb = () => {
    dbRef.current?.close();
    dbRef.current = null;
    setSqlResults(null);
    setSqlMsg('Database reset to its original data.');
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        {title && <span className="mr-auto text-sm font-medium text-slate-700 dark:text-slate-200">{title}</span>}
        {!title && <span className="mr-auto text-xs font-semibold uppercase tracking-wide text-slate-500">{lang === 'sql' ? 'SQLite' : 'Python'}</span>}
        {lang === 'python' && <PythonStatusBadge />}
        <button className="btn-primary !py-1.5" onClick={run} disabled={running} title="Run (Ctrl+Enter)">
          {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Run
        </button>
        {lang === 'python' && running && (
          <button className="btn-secondary !py-1.5" onClick={() => restartPython('Stopped by you.')} title="Stop execution">
            <Square size={14} /> Stop
          </button>
        )}
        {lang === 'python' && (
          <button className={`btn-ghost !px-2 !py-1.5 ${stdinOpen ? 'text-indigo-600' : ''}`} onClick={() => setStdinOpen((v) => !v)} title="Provide input() values">
            <Keyboard size={15} />
          </button>
        )}
        {lang === 'sql' && persistDb && (
          <button className="btn-ghost !px-2 !py-1.5" onClick={resetDb} title="Reset database">
            <DbIcon size={15} />
          </button>
        )}
        <button className="btn-ghost !px-2 !py-1.5" onClick={() => change(resetCode ?? initial)} disabled={code === (resetCode ?? initial)} title="Reset code to original" aria-label="Reset code to original">
          <RotateCcw size={15} />
        </button>
        {extraButtons}
      </div>
      <CodeEditor value={code} onChange={change} lang={lang} onRun={run} minHeight={minHeight} />
      {stdinOpen && lang === 'python' && (
        <div className="border-t border-slate-200 p-2 dark:border-slate-700">
          <label className="mb-1 block text-xs text-slate-500">Input for input() — one value per line</label>
          <textarea className="input font-mono" rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)} />
        </div>
      )}
      <div className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {lang === 'python' ? (
          <OutputPanel items={output} placeholder={st.status === 'idle' ? 'Press Run (or Ctrl+Enter). The first run downloads Python (~10 MB), which can take a few seconds.' : undefined} />
        ) : (
          <div className="space-y-3 px-4 py-3 text-sm">
            {sqlMsg && <div className={sqlMsg.startsWith('Error') ? 'font-mono text-rose-600' : 'text-slate-500'}>{sqlMsg}</div>}
            {sqlResults?.map((r, i) => <SqlTable key={i} result={r} />)}
            {!sqlMsg && !sqlResults && <div className="font-mono text-xs text-slate-400">Press Run (or Ctrl+Enter) to execute the query.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
