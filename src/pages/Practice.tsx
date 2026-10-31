import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { ALL_EXERCISES, MODULES, getLesson, lessonPath, moduleOf } from '../content';
import { useProgress } from '../lib/progress';
import { weekKey, weeklyChallenge } from '../lib/gamification';
import { ExerciseCard } from '../components/ExerciseCard';
import { Quiz } from '../components/Quiz';
import { PageHeader, ProgressBar } from '../components/ui';
import { lessonContext } from './LessonPage';

const TABS = [
  ['weekly', 'Weekly challenge'],
  ['all', 'All exercises'],
  ['review', 'Review missed questions'],
] as const;

export function Practice() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as (typeof TABS)[number][0]) || 'all';
  const { state, actions } = useProgress();
  const [mod, setMod] = useState('all');
  const [type, setType] = useState('all');
  const [lang, setLang] = useState('all');
  const [diff, setDiff] = useState('all');
  const [status, setStatus] = useState('unsolved');
  const [limit, setLimit] = useState(8);

  const filtered = useMemo(
    () =>
      ALL_EXERCISES.filter(
        (e) =>
          (mod === 'all' || e.moduleId === mod) &&
          (type === 'all' || e.type === type) &&
          (lang === 'all' || e.lang === lang) &&
          (diff === 'all' || e.difficulty === diff) &&
          (status === 'all' || (status === 'solved' ? state.exercises[e.id] : !state.exercises[e.id])),
      ),
    [mod, type, lang, diff, status, state.exercises],
  );
  useEffect(() => setLimit(8), [mod, type, lang, diff, status]);

  const wk = weekKey();
  const weekly = weeklyChallenge(state, wk);
  const weeklyDone = weekly.filter((e) => state.exercises[e.id]).length;
  useEffect(() => {
    if (weekly.length && weeklyDone === weekly.length && !state.weekly[wk]) actions.completeWeekly(wk);
  }, [weeklyDone, weekly.length, wk, state.weekly, actions]);

  const missed = useMemo(
    () =>
      Object.entries(state.quizzes).flatMap(([lid, rec]) => {
        const l = getLesson(lid);
        return l ? l.quiz.filter((q) => rec.wrongIds.includes(q.id)) : [];
      }),
    [state.quizzes],
  );

  const solvedCount = Object.keys(state.exercises).length;

  return (
    <div>
      <PageHeader title="Practice Exercises" subtitle={`${ALL_EXERCISES.length} exercises across all modules · ${solvedCount} solved`} />
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setParams({ tab: id })} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${tab === id ? 'bg-white shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'weekly' && (
        <div className="space-y-5">
          <div className="card flex flex-wrap items-center gap-4 p-5">
            <Trophy className="text-amber-500" size={32} />
            <div className="flex-1">
              <div className="font-semibold">Weekly challenge · {wk}</div>
              <div className="text-sm text-slate-500">Three exercises picked from the modules you have reached. Solve all three for +150 XP. A new set appears every Monday.</div>
              <ProgressBar pct={(weeklyDone / Math.max(1, weekly.length)) * 100} className="mt-2" color="bg-amber-500" />
            </div>
            <div className="text-lg font-bold">{state.weekly[wk] ? 'Completed ✓' : `${weeklyDone}/${weekly.length}`}</div>
          </div>
          {weekly.map((e, i) => {
            const l = getLesson(ALL_EXERCISES.find((x) => x.id === e.id)!.lessonId)!;
            return (
              <div key={e.id}>
                <div className="mb-1 text-xs text-slate-500">From: <Link className="text-indigo-600 hover:underline dark:text-indigo-400" to={lessonPath(l.id)}>{l.title}</Link></div>
                <ExerciseCard ex={e} index={i} context={lessonContext(l, moduleOf(l.id)!.title)} />
              </div>
            );
          })}
        </div>
      )}

      {tab === 'all' && (
        <div>
          <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-5">
            <select className="input" value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Module">
              <option value="all">All modules</option>
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.number}. {m.short}</option>)}
            </select>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
              <option value="all">All types</option>
              <option value="write">Write code</option>
              <option value="debug">Debugging</option>
              <option value="fill">Fill in the blank</option>
              <option value="predict">Predict the output</option>
              <option value="dataset">Dataset analysis</option>
            </select>
            <select className="input" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
              <option value="all">Python & SQL</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
            </select>
            <select className="input" value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty">
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved</option>
              <option value="all">All</option>
            </select>
          </div>
          <p className="mb-3 text-sm text-slate-500">{filtered.length} matching exercises</p>
          <div className="space-y-5">
            {filtered.slice(0, limit).map((e) => {
              const l = getLesson(e.lessonId)!;
              return (
                <div key={e.id}>
                  <div className="mb-1 text-xs text-slate-500">Module {moduleOf(l.id)!.number} · <Link className="text-indigo-600 hover:underline dark:text-indigo-400" to={lessonPath(l.id)}>{l.title}</Link></div>
                  <ExerciseCard ex={e} context={lessonContext(l, moduleOf(l.id)!.title)} />
                </div>
              );
            })}
          </div>
          {filtered.length > limit && <button className="btn-secondary mt-5 w-full" onClick={() => setLimit((n) => n + 8)}>Show more ({filtered.length - limit} remaining)</button>}
        </div>
      )}

      {tab === 'review' && (
        <div>
          {missed.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">No missed questions to review. Questions you answer incorrectly in lesson quizzes appear here.</div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">{missed.length} questions you missed on your latest quiz attempts. Practicing them here doesn't change your lesson scores — retake the lesson quiz to improve those.</p>
              <Quiz questions={missed} shuffle />
            </>
          )}
        </div>
      )}
    </div>
  );
}
