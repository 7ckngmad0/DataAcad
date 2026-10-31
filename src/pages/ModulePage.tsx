import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, Flag, ChevronLeft } from 'lucide-react';
import { getModule } from '../content';
import { useProgress } from '../lib/progress';
import { moduleProgress, quizPct } from '../lib/gamification';
import { ModuleIcon } from '../components/ModuleIcon';
import { DifficultyChip, PageHeader, ProgressBar } from '../components/ui';

export function ModulePage() {
  const { moduleId } = useParams();
  const m = getModule(moduleId!);
  const { state } = useProgress();
  if (!m) return <p>Module not found. <Link to="/courses" className="text-indigo-600">Back to courses</Link></p>;
  const p = moduleProgress(m, state);
  const cp = state.checkpoints[m.id];

  return (
    <div>
      <Link to="/courses" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"><ChevronLeft size={16} /> All courses</Link>
      <PageHeader title={`Module ${m.number}: ${m.title}`} subtitle={m.description}>
        <ModuleIcon name={m.icon} size={40} className="text-indigo-500" />
      </PageHeader>
      <div className="card mb-6 p-5">
        <div className="flex justify-between text-sm"><span className="font-medium">Module progress</span><span>{p.done}/{p.total} lessons · {p.pct}%</span></div>
        <ProgressBar pct={p.pct} className="mt-2" />
        <div className="mt-4 text-sm font-medium">Skills you will gain</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {m.skills.map((s) => <span key={s} className="chip bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{s}</span>)}
        </div>
      </div>

      <ol className="space-y-3">
        {m.lessons.map((l, i) => {
          const done = !!state.completedLessons[l.id];
          const qp = quizPct(state, l.id);
          return (
            <li key={l.id}>
              <Link to={`/courses/${m.id}/${l.id}`} className="card flex items-center gap-4 p-4 transition hover:border-indigo-400">
                {done ? <CheckCircle2 className="shrink-0 text-emerald-500" /> : <Circle className="shrink-0 text-slate-300 dark:text-slate-600" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-400">{m.number}.{i + 1}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{l.title}</span>
                    {l.optional && <span className="chip bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Optional specialization</span>}
                  </div>
                  <div className="mt-0.5 truncate text-sm text-slate-500">{l.objectives.slice(0, 2).join(' · ')}</div>
                </div>
                <div className="hidden shrink-0 items-center gap-3 text-xs text-slate-500 sm:flex">
                  <DifficultyChip d={l.difficulty} />
                  <span className="flex items-center gap-1"><Clock size={13} /> {l.minutes}m</span>
                  {qp !== null && <span className={`font-semibold ${qp >= 80 ? 'text-emerald-600' : qp >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>Quiz {qp}%</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <Link to={`/courses/${m.id}/checkpoint`} className="card mt-6 flex items-center gap-4 border-dashed p-5 transition hover:border-indigo-400">
        <Flag className="text-amber-500" />
        <div className="flex-1">
          <div className="font-semibold">Knowledge checkpoint</div>
          <div className="text-sm text-slate-500">A mixed quiz drawn from every lesson in this module. Score 80% or more to prove mastery.</div>
        </div>
        {cp && <span className="text-sm font-semibold">Best: {Math.round((cp.best / cp.total) * 100)}%</span>}
      </Link>
    </div>
  );
}
