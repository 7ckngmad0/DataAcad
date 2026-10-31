import { Link } from 'react-router-dom';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { Flame, Sparkles, BookCheck, Dumbbell, FolderKanban, Lock } from 'lucide-react';
import { computeStreak, today, useProgress } from '../lib/progress';
import { BADGES, lessonsToReview, overallProgress, skillStatuses } from '../lib/gamification';
import { lessonPath, moduleOf } from '../content';
import { PageHeader, ProgressBar, Stat } from '../components/ui';
import { ModuleIcon } from '../components/ModuleIcon';
import { useIsDark } from '../lib/useIsDark';

const STATUS = {
  mastered: ['Mastered', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'],
  progressing: ['In progress', 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'],
  'needs-work': ['Needs improvement', 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'],
  'not-started': ['Not started', 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'],
} as const;

function Heatmap({ xpByDay }: { xpByDay: Record<string, number> }) {
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    return today(d);
  });
  const level = (xp: number) => (xp === 0 ? 'bg-slate-100 dark:bg-slate-800' : xp < 50 ? 'bg-indigo-200 dark:bg-indigo-900' : xp < 120 ? 'bg-indigo-400 dark:bg-indigo-700' : 'bg-indigo-600 dark:bg-indigo-500');
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
      {days.map((d) => <div key={d} title={`${d}: ${xpByDay[d] || 0} XP`} className={`h-3.5 w-3.5 rounded-sm ${level(xpByDay[d] || 0)}`} />)}
    </div>
  );
}

export function ProgressPage() {
  const { state } = useProgress();
  const dark = useIsDark();
  const skills = skillStatuses(state);
  const review = lessonsToReview(state);
  const overall = overallProgress(state);
  const radar = skills.map((s) => ({ skill: s.module.short, value: Math.round((s.lessonsDone / s.module.lessons.length) * 100) }));
  const earned = BADGES.filter((b) => state.badges[b.id]).length;
  const projectsDone = Object.values(state.projects).filter((p) => p.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Progress & Achievements" subtitle={`${overall.done}/${overall.total} lessons · ${earned}/${BADGES.length} badges earned`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat icon={<Sparkles size={20} />} label="Total XP" value={state.xp.toLocaleString()} />
        <Stat icon={<Flame size={20} />} label="Current streak" value={`${computeStreak(state.activityDays)} days`} sub={`${state.activityDays.length} active days total`} />
        <Stat icon={<BookCheck size={20} />} label="Lessons" value={`${overall.done}/${overall.total}`} />
        <Stat icon={<Dumbbell size={20} />} label="Exercises solved" value={Object.keys(state.exercises).length} />
        <Stat icon={<FolderKanban size={20} />} label="Projects" value={projectsDone} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title">Skill coverage</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke={dark ? '#334155' : '#cbd5e1'} />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: dark ? '#94a3b8' : '#475569' }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5">
          <h2 className="section-title">Activity (last 12 weeks)</h2>
          <Heatmap xpByDay={state.xpByDay} />
          <h3 className="mt-6 mb-2 font-semibold">Lessons to review</h3>
          {review.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing flagged. Lessons with a best quiz score under 70% show up here.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {review.map((l) => {
                const q = state.quizzes[l.id];
                return (
                  <li key={l.id} className="flex items-center gap-2">
                    <Link to={lessonPath(l.id)} className="text-indigo-600 hover:underline dark:text-indigo-400">{l.title}</Link>
                    <span className="text-xs text-rose-600">best {Math.round((q.best / q.total) * 100)}%</span>
                    <span className="ml-auto text-xs text-slate-400">Module {moduleOf(l.id)?.number}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5">
        <h2 className="section-title">Skills mastered & skills that need improvement</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {skills.map((s) => (
            <div key={s.module.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <ModuleIcon name={s.module.icon} className="shrink-0 text-indigo-500" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/courses/${s.module.id}`} className="truncate text-sm font-semibold hover:text-indigo-600">{s.module.number}. {s.module.title}</Link>
                  <span className={`chip ml-auto shrink-0 ${STATUS[s.status][1]}`}>{STATUS[s.status][0]}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <ProgressBar pct={(s.lessonsDone / s.module.lessons.length) * 100} className="flex-1" />
                  <span>{s.lessonsDone}/{s.module.lessons.length}</span>
                  <span className="whitespace-nowrap">· quiz avg {s.avgQuiz === null ? '—' : `${s.avgQuiz}%`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Mastered = every lesson complete with a quiz average of 80%+. Needs improvement = quiz average below 60%.</p>
      </section>

      <section className="card p-5">
        <h2 className="section-title">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const got = state.badges[b.id];
            return (
              <div key={b.id} className={`rounded-xl border p-3 text-center ${got ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20' : 'border-slate-200 opacity-60 dark:border-slate-800'}`}>
                <div className="text-3xl">{got ? b.icon : <Lock className="mx-auto my-1 text-slate-400" size={26} />}</div>
                <div className="mt-1 text-sm font-semibold">{b.title}</div>
                <div className="text-xs text-slate-500">{b.description}</div>
                {got && <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">{new Date(got).toLocaleDateString()}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
