import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lightbulb, Eye, Bot, Loader2, XCircle, ShieldCheck } from 'lucide-react';
import type { Exercise } from '../types';
import { Markdown } from './Markdown';
import { CodeRunner } from './CodeRunner';
import { CodeEditor } from './CodeEditor';
import { runPython } from '../lib/python';
import { checkSql } from '../lib/sql';
import { useProgress } from '../lib/progress';
import { DifficultyChip } from './ui';

const TYPE_LABEL: Record<Exercise['type'], string> = {
  write: 'Write code',
  debug: 'Debug',
  fill: 'Fill in the blank',
  predict: 'Predict the output',
  dataset: 'Dataset analysis',
};

export const normalizeAnswer = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/^['"]|['"]$/g, '').replace(/\.$/, '');

export function ExerciseCard({ ex, index, context }: { ex: Exercise; index?: number; context?: string }) {
  const { state, actions } = useProgress();
  const navigate = useNavigate();
  const solved = !!state.exercises[ex.id];
  // Starters end with a newline so the learner's cursor lands on a fresh line.
  const starter = ex.starter ? ex.starter.replace(/\n*$/, '\n') : '';
  const saveKey = `dsa-ex-code:${ex.id}`;
  // The learner's work-in-progress survives refreshes and navigation.
  const [savedCode] = useState(() => {
    try {
      return localStorage.getItem(saveKey) ?? starter;
    } catch {
      return starter;
    }
  });
  const [code, setCode] = useState(savedCode);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (code === starter) localStorage.removeItem(saveKey);
        else localStorage.setItem(saveKey, code);
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code, starter, saveKey]);
  const [answer, setAnswer] = useState('');
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const textAnswer = !!ex.accepted;

  const check = async () => {
    setChecking(true);
    setAttempts((a) => a + 1);
    let err: string | null | undefined = null;
    if (textAnswer) {
      const ok = ex.accepted!.some((a) => normalizeAnswer(a) === normalizeAnswer(answer));
      err = ok ? null : 'Not quite. Trace through the code line by line, then try again.';
    } else if (ex.lang === 'sql') {
      err = await checkSql(ex.db ?? 'shop', code, ex.solution);
    } else {
      const r = await runPython(code, { tests: ex.tests ?? '' });
      err = r.error ? `Your code raised an error:\n${r.error}` : r.testError;
    }
    setChecking(false);
    if (!err) {
      setFeedback({ ok: true, msg: solved ? 'Correct again — nice!' : 'Correct! Well done.' });
      actions.solveExercise(ex.id);
    } else setFeedback({ ok: false, msg: err });
  };

  const askTutor = (mode: 'hint' | 'debug') =>
    navigate('/tutor', {
      state: {
        mode,
        context,
        prompt:
          `I'm working on this exercise: "${ex.title}".\n\nTask:\n${ex.prompt}\n\n` +
          (textAnswer ? `My answer: ${answer || '(none yet)'}` : `My code:\n\`\`\`${ex.lang}\n${code}\n\`\`\``) +
          (feedback && !feedback.ok ? `\n\nThe checker said:\n${feedback.msg}` : '') +
          (mode === 'hint' ? '\n\nCan you give me a hint (not the full solution)?' : '\n\nCan you help me find what is wrong?'),
      },
    });

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {index !== undefined && <span className="text-sm font-semibold text-slate-400">#{index + 1}</span>}
        <h4 className="font-semibold text-slate-900 dark:text-white">{ex.title}</h4>
        <span className="chip bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{TYPE_LABEL[ex.type]}</span>
        <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{ex.lang === 'sql' ? 'SQL' : 'Python'}</span>
        <DifficultyChip d={ex.difficulty} />
        {solved && (
          <span className="chip ml-auto bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={13} /> Solved
          </span>
        )}
      </div>
      <Markdown>{ex.prompt}</Markdown>
      {ex.db && ex.lang === 'sql' && <p className="mt-2 text-xs text-slate-500">Database: <b>{ex.db}</b> (see the schema in the SQL Playground)</p>}

      <div className="mt-4">
        {textAnswer ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="input font-mono" placeholder="Type your answer…" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} />
          </div>
        ) : (
          <CodeRunner code={savedCode} resetCode={starter} lang={ex.lang} db={ex.db} onCodeChange={setCode} minHeight="120px" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-success" onClick={check} disabled={checking || (textAnswer && !answer.trim())}>
          {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} Check answer
        </button>
        <button className="btn-secondary" onClick={() => setHintsShown((h) => Math.min(h + 1, ex.hints.length))} disabled={hintsShown >= ex.hints.length}>
          <Lightbulb size={15} /> {hintsShown ? 'Next hint' : 'Hint'} ({hintsShown}/{ex.hints.length})
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowSolution((v) => !v)}
          disabled={attempts === 0 && !solved}
          title={attempts === 0 && !solved ? 'Make at least one attempt first' : ''}
        >
          <Eye size={15} /> {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
        <button className="btn-ghost" onClick={() => askTutor(feedback && !feedback.ok && !textAnswer ? 'debug' : 'hint')}>
          <Bot size={15} /> Ask the tutor
        </button>
      </div>

      {feedback && (
        <div className={`mt-3 flex gap-2 rounded-lg p-3 text-sm ${feedback.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200'}`}>
          {feedback.ok ? <CheckCircle2 size={18} className="shrink-0" /> : <XCircle size={18} className="shrink-0" />}
          <pre className="whitespace-pre-wrap font-sans">{feedback.msg}</pre>
        </div>
      )}
      {hintsShown > 0 && (
        <ul className="mt-3 space-y-2">
          {ex.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Lightbulb size={16} className="mt-0.5 shrink-0" />
              <Markdown>{h}</Markdown>
            </li>
          ))}
        </ul>
      )}
      {showSolution && (
        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Reference solution</div>
          {textAnswer ? (
            <pre className="rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800">{ex.solution}</pre>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <CodeEditor value={ex.solution} lang={ex.lang} readOnly />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
