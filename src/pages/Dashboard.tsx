import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Flame, Target, Sparkles, BookCheck, Trophy, Calendar, RotateCcw, CheckCircle2 } from 'lucide-react';
import { computeStreak, today, useProgress } from '../lib/progress';
import { BADGES, lessonsToReview, moduleProgress, nextLesson, overallProgress, weekKey, weeklyChallenge } from '../lib/gamification';
import { getLesson, lessonPath, moduleOf, MODULES } from '../content';
import { ProgressBar, ProgressRing, Stat } from '../components/ui';
import { ModuleIcon } from '../components/ModuleIcon';
import { useIsDark } from '../lib/useIsDark';

export function Dashboard() {
  const { state } = useProgress();
  const dark = useIsDark();
  const overall = overallProgress(state);
  const streak = computeStreak(state.activityDays);
  const todayXp = state.xpByDay[today()] || 0;
  const goal = state.settings.dailyGoalXp;
  const last = state.lastLesson ? getLesson(state.lastLesson) : undefined;
  const continueLesson = last && !state.completedLessons[last.id] ? last : nextLesson(state);
  const review = lessonsToReview(state).slice(0, 2);
  const upcoming = [continueLesson, ...[nextLesson(state)]].filter(Boolean);
  const recommended = Array.from(new Set([...upcoming, ...review].map((l) => l!.id))).slice(0, 4).map((id) => getLesson(id)!);
  const lessonsToday = Object.values(state.completedLessons).filter((d) => today(new Date(d)) === today()).length;
  const quizVals = Object.values(state.quizzes);
  const quizAvg = quizVals.length ? Math.round((quizVals.reduce((a, q) => a + q.best / q.total, 0) / quizVals.length) * 100) : null;
  const recentBadges = Object.entries(state.badges).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 4).map(([id]) => BADGES.find((b) => b.id === id)).filter(Boolean);
  const weekly = weeklyChallenge(state);
  const weeklyDone = weekly.filter((e) => state.exercises[e.id]).length;
  const wk = weekKey();

  const chart = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), xp: state.xpByDay[today(d)] || 0 };
  });

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-6 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-100">{greet}{state.settings.name ? `, ${state.settings.name}` : ''} 👋</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{overall.done === 0 ? 'Welcome to your Data Science journey' : 'Keep building your Data Science skills'}</h1>
            <p className="mt-2 max-w-xl text-indigo-100">
              {overall.done === 0
                ? 'Start from zero: 12 modules take you from "what is data?" to machine learning and a professional portfolio.'
                : `You have completed ${overall.done} of ${overall.total} lessons. Consistency beats intensity — a little every day adds up.`}
            </p>
            {continueLesson && (
              <Link to={lessonPath(continueLesson.id)} className="btn mt-5 bg-white text-indigo-700 hover:bg-indigo-50">
                {overall.done === 0 ? 'Start learning' : 'Continue learning'}: {continueLesson.title} <ArrowRight size={16} />
              </Link>
            )}
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <ProgressRing pct={overall.pct} size={120} label={<div><div className="text-2xl font-bold text-white">{overall.pct}%</div><div className="text-xs text-indigo-100">complete</div></div>} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<Flame size={20} />} label="Study streak" value={`${streak} day${streak === 1 ? '' : 's'}`} sub={streak ? 'Keep it going!' : 'Learn today to start one'} />
        <Stat icon={<Sparkles size={20} />} label="Total XP" value={state.xp.toLocaleString()} sub={`${todayXp} XP today`} />
        <Stat icon={<BookCheck size={20} />} label="Lessons completed" value={`${overall.done}/${overall.total}`} sub={`${Object.keys(state.exercises).length} exercises solved`} />
        <Stat icon={<Target size={20} />} label="Quiz average" value={quizAvg === null ? '—' : `${quizAvg}%`} sub={`${quizVals.length} quizzes taken`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="section-title"><Sparkles size={18} className="text-indigo-500" /> Recommended for you</h2>
          {recommended.length === 0 && <p className="text-sm text-slate-500">You have completed every lesson. Time to polish your portfolio projects!</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((l) => {
              const m = moduleOf(l.id)!;
              const isReview = !!state.completedLessons[l.id] || review.some((r) => r.id === l.id);
              return (
                <Link key={l.id} to={lessonPath(l.id)} className="group rounded-xl border border-slate-200 p-4 transition hover:border-indigo-400 hover:shadow-sm dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ModuleIcon name={m.icon} size={14} /> Module {m.number} · {l.minutes} min
                    {isReview && <span className="chip ml-auto bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><RotateCcw size={11} /> Review</span>}
                  </div>
                  <div className="mt-1 font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white">{l.title}</div>
                  <div className="mt-1 line-clamp-2 text-sm text-slate-500">{l.objectives[0]}</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="section-title"><Target size={18} className="text-orange-500" /> Daily goal</h2>
          <div className="flex items-center gap-4">
            <ProgressRing pct={Math.round((todayXp / goal) * 100)} size={90} label={<span className="text-sm font-bold">{todayXp}/{goal}</span>} />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {todayXp >= goal ? <p className="font-semibold text-emerald-600">Goal reached today! 🎉</p> : <p>Earn <b>{goal - todayXp} more XP</b> today to hit your goal.</p>}
              <p className="mt-1">Lessons completed today: <b>{lessonsToday}</b></p>
              <Link to="/settings" className="mt-1 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400">Change goal</Link>
            </div>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-slate-500">
            <li>Lesson completed: +50 XP</li>
            <li>Exercise solved: +20 XP</li>
            <li>Each new correct quiz answer: +10 XP (+25 for a perfect score)</li>
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="section-title"><Calendar size={18} className="text-indigo-500" /> Learning activity (last 14 days)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: dark ? '#0f172a' : '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }} />
                <Bar dataKey="xp" name="XP" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="section-title"><Trophy size={18} className="text-amber-500" /> Weekly challenge</h2>
          <p className="text-sm text-slate-500">Week {wk.split('-W')[1]} · Solve these 3 exercises for <b>+150 XP</b>.</p>
          <ul className="mt-3 space-y-2">
            {weekly.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                {state.exercises[e.id] ? <CheckCircle2 size={16} className="text-emerald-500" /> : <span className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                <span className={state.exercises[e.id] ? 'text-slate-400 line-through' : ''}>{e.title}</span>
              </li>
            ))}
          </ul>
          <ProgressBar pct={(weeklyDone / Math.max(1, weekly.length)) * 100} className="mt-3" color="bg-amber-500" />
          <Link to="/practice?tab=weekly" className="btn-secondary mt-3 w-full">{state.weekly[wk] ? 'Completed ✓' : 'Go to challenge'}</Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="section-title">Module progress</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODULES.map((m) => {
              const p = moduleProgress(m, state);
              return (
                <Link to={`/courses/${m.id}`} key={m.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <ModuleIcon name={m.icon} size={18} className="shrink-0 text-indigo-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm"><span className="truncate font-medium">{m.number}. {m.short}</span><span className="text-slate-500">{p.done}/{p.total}</span></div>
                    <ProgressBar pct={p.pct} className="mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="section-title">Recent achievements</h2>
          {recentBadges.length === 0 ? (
            <p className="text-sm text-slate-500">Complete your first lesson to earn your first badge.</p>
          ) : (
            <ul className="space-y-3">
              {recentBadges.map((b) => (
                <li key={b!.id} className="flex items-center gap-3">
                  <span className="text-2xl">{b!.icon}</span>
                  <div><div className="text-sm font-semibold">{b!.title}</div><div className="text-xs text-slate-500">{b!.description}</div></div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/progress" className="mt-4 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400">View all achievements →</Link>
        </section>
      </div>
    </div>
  );
}
