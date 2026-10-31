import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle, Flag } from 'lucide-react';
import { MODULES, lessonPath, PROJECTS } from '../content';
import { useProgress } from '../lib/progress';
import { moduleComplete, moduleProgress, nextLesson } from '../lib/gamification';
import { ModuleIcon } from '../components/ModuleIcon';
import { PageHeader, ProgressBar } from '../components/ui';

const PHASES = [
  { title: 'Phase 1 · Foundations', modules: ['intro', 'python', 'math', 'stats'], note: 'Programming, math and statistics — the base everything else is built on.' },
  { title: 'Phase 2 · Working with Data', modules: ['libraries', 'eda', 'viz', 'sql'], note: 'The daily toolkit of analysts and data scientists.' },
  { title: 'Phase 3 · Insight & Prediction', modules: ['bi', 'ml'], note: 'Turn data into decisions and models.' },
  { title: 'Phase 4 · Specialize & Get Hired', modules: ['advanced', 'portfolio'], note: 'Explore advanced fields and build a portfolio that gets interviews.' },
];

export function Roadmap() {
  const { state } = useProgress();
  const next = nextLesson(state);
  return (
    <div>
      <PageHeader title="Learning Roadmap" subtitle="A structured path from absolute beginner to internship-ready. Follow it in order — each module builds on the previous ones." />
      <div className="space-y-8">
        {PHASES.map((ph) => (
          <section key={ph.title}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{ph.title}</h2>
            <p className="mb-4 text-sm text-slate-500">{ph.note}</p>
            <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
              {ph.modules.map((id) => {
                const m = MODULES.find((x) => x.id === id)!;
                const p = moduleProgress(m, state);
                const done = moduleComplete(m, state);
                const current = next && m.lessons.some((l) => l.id === next.id);
                return (
                  <li key={m.id} className="relative">
                    <span className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-slate-50 dark:ring-slate-950 ${done ? 'bg-emerald-500 text-white' : current ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                      {done ? <CheckCircle2 size={14} /> : current ? <PlayCircle size={14} /> : <Circle size={10} />}
                    </span>
                    <div className={`card p-5 ${current ? 'ring-2 ring-indigo-500' : ''}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <ModuleIcon name={m.icon} className="text-indigo-500" />
                        <Link to={`/courses/${m.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-white">
                          Module {m.number}: {m.title}
                        </Link>
                        <span className="ml-auto text-sm text-slate-500">{p.done}/{p.total} lessons</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{m.description}</p>
                      <ProgressBar pct={p.pct} className="mt-3" color={done ? 'bg-emerald-500' : 'bg-indigo-600'} />
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.skills.map((s) => (
                          <span key={s} className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s}</span>
                        ))}
                      </div>
                      {current && next && (
                        <Link to={lessonPath(next.id)} className="btn-primary mt-4">Continue: {next.title}</Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        <section className="card flex flex-wrap items-center gap-4 p-5">
          <Flag className="text-emerald-500" />
          <div className="flex-1">
            <div className="font-semibold">Finish line: a portfolio of {PROJECTS.length} projects</div>
            <p className="text-sm text-slate-500">Projects unlock gradually in difficulty. Aim for at least 3 polished ones (one beginner, one intermediate, one advanced) before applying for internships.</p>
          </div>
          <Link to="/projects" className="btn-secondary">View projects</Link>
        </section>
      </div>
    </div>
  );
}
