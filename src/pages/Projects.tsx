import { Link } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';
import { PROJECTS } from '../content';
import { useProgress } from '../lib/progress';
import { PageHeader, ProgressBar } from '../components/ui';

const LEVEL_CLS = {
  Beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Advanced: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export function Projects() {
  const { state } = useProgress();
  return (
    <div>
      <PageHeader title="Real-World Projects" subtitle="Portfolio projects with a business problem, dataset, step-by-step guide, evaluation rubric and report template. Build them in the in-browser workspace or in your own Jupyter setup." />
      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
        <section key={lvl} className="mb-8">
          <h2 className="mb-3 text-lg font-bold">{lvl} projects</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PROJECTS.filter((p) => p.level === lvl).map((p) => {
              const rec = state.projects[p.id];
              const doneSteps = rec ? Object.values(rec.steps).filter(Boolean).length : 0;
              return (
                <Link to={`/projects/${p.id}`} key={p.id} className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${LEVEL_CLS[p.level]}`}>{p.level}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={12} /> ~{p.hours} h</span>
                    {rec?.completed && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
                  </div>
                  <div className="mt-2 font-semibold text-slate-900 dark:text-white">{p.title}</div>
                  <p className="mt-1 line-clamp-3 flex-1 text-sm text-slate-500">{p.businessProblem}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.skills.slice(0, 4).map((s) => <span key={s} className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s}</span>)}
                  </div>
                  <ProgressBar pct={(doneSteps / p.steps.length) * 100} className="mt-3" color={rec?.completed ? 'bg-emerald-500' : 'bg-indigo-600'} />
                  <div className="mt-1 text-xs text-slate-500">{doneSteps}/{p.steps.length} steps</div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
