import { Link } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';
import { MODULES } from '../content';
import { useProgress } from '../lib/progress';
import { moduleProgress } from '../lib/gamification';
import { ModuleIcon } from '../components/ModuleIcon';
import { PageHeader, ProgressBar } from '../components/ui';

export function Courses() {
  const { state } = useProgress();
  return (
    <div>
      <PageHeader title="Courses" subtitle="12 modules · every lesson includes explanations, runnable code, exercises and a quiz." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((m) => {
          const p = moduleProgress(m, state);
          const minutes = m.lessons.reduce((a, l) => a + l.minutes, 0);
          return (
            <Link key={m.id} to={`/courses/${m.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <ModuleIcon name={m.icon} size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Module {m.number}</div>
                  <div className="font-semibold leading-tight text-slate-900 group-hover:text-indigo-600 dark:text-white">{m.title}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{m.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><BookOpen size={13} /> {m.lessons.length} lessons</span>
                <span className="flex items-center gap-1"><Clock size={13} /> ~{Math.round(minutes / 60)} h</span>
                <span className="ml-auto font-medium">{p.pct}%</span>
              </div>
              <ProgressBar pct={p.pct} className="mt-2" color={p.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
