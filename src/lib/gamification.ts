import { ALL_EXERCISES, ALL_LESSONS, MODULES } from '../content';
import type { Exercise, Lesson, Module } from '../types';
import { computeStreak, type ProgressState } from './progress-state';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  check(s: ProgressState): boolean;
}

export const moduleComplete = (m: Module, s: ProgressState) => m.lessons.length > 0 && m.lessons.every((l) => s.completedLessons[l.id]);

const count = (o: Record<string, unknown>) => Object.keys(o).length;
const sqlSolved = (s: ProgressState) => ALL_EXERCISES.filter((e) => e.lang === 'sql' && s.exercises[e.id]).length;

export const BADGES: Badge[] = [
  { id: 'first-lesson', title: 'First Step', description: 'Complete your first lesson.', icon: '🎯', check: (s) => count(s.completedLessons) >= 1 },
  { id: 'ten-lessons', title: 'Curious Mind', description: 'Complete 10 lessons.', icon: '📚', check: (s) => count(s.completedLessons) >= 10 },
  { id: 'thirty-lessons', title: 'Scholar', description: 'Complete 30 lessons.', icon: '🎓', check: (s) => count(s.completedLessons) >= 30 },
  { id: 'first-exercise', title: 'Hello, Code', description: 'Solve your first coding exercise.', icon: '💻', check: (s) => count(s.exercises) >= 1 },
  { id: 'exercises-25', title: 'Practice Makes Progress', description: 'Solve 25 exercises.', icon: '🛠️', check: (s) => count(s.exercises) >= 25 },
  { id: 'exercises-75', title: 'Problem Solver', description: 'Solve 75 exercises.', icon: '🧠', check: (s) => count(s.exercises) >= 75 },
  { id: 'quiz-ace', title: 'Quiz Ace', description: 'Score 100% on a lesson quiz.', icon: '⭐', check: (s) => Object.values(s.quizzes).some((q) => q.best === q.total && q.total > 0) },
  { id: 'sql-ninja', title: 'SQL Ninja', description: 'Solve 5 SQL exercises.', icon: '🗄️', check: (s) => sqlSolved(s) >= 5 },
  { id: 'checkpoint', title: 'Checkpoint Cleared', description: 'Score 80%+ on a module checkpoint.', icon: '🚩', check: (s) => Object.values(s.checkpoints).some((c) => c.best / c.total >= 0.8) },
  { id: 'streak-3', title: 'On a Roll', description: 'Learn 3 days in a row.', icon: '🔥', check: (s) => computeStreak(s.activityDays) >= 3 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Learn 7 days in a row.', icon: '⚡', check: (s) => computeStreak(s.activityDays) >= 7 },
  { id: 'streak-30', title: 'Unstoppable', description: 'Learn 30 days in a row.', icon: '🏆', check: (s) => computeStreak(s.activityDays) >= 30 },
  { id: 'xp-1000', title: 'Rising Analyst', description: 'Earn 1,000 XP.', icon: '📈', check: (s) => s.xp >= 1000 },
  { id: 'xp-5000', title: 'Data Pro', description: 'Earn 5,000 XP.', icon: '💎', check: (s) => s.xp >= 5000 },
  { id: 'weekly', title: 'Challenge Accepted', description: 'Finish a weekly challenge.', icon: '📅', check: (s) => count(s.weekly) >= 1 },
  { id: 'first-project', title: 'Builder', description: 'Complete your first portfolio project.', icon: '🧱', check: (s) => Object.values(s.projects).some((p) => p.completed) },
  { id: 'three-projects', title: 'Portfolio Ready', description: 'Complete 3 portfolio projects.', icon: '💼', check: (s) => Object.values(s.projects).filter((p) => p.completed).length >= 3 },
  ...MODULES.map<Badge>((m) => ({
    id: `module-${m.id}`,
    title: `${m.short} Graduate`,
    description: `Complete every lesson in Module ${m.number}: ${m.title}.`,
    icon: '🏅',
    check: (s) => moduleComplete(m, s),
  })),
];

export function moduleProgress(m: Module, s: ProgressState) {
  const done = m.lessons.filter((l) => s.completedLessons[l.id]).length;
  return { done, total: m.lessons.length, pct: m.lessons.length ? Math.round((done / m.lessons.length) * 100) : 0 };
}

export function overallProgress(s: ProgressState) {
  const done = ALL_LESSONS.filter((l) => s.completedLessons[l.id]).length;
  return { done, total: ALL_LESSONS.length, pct: Math.round((done / ALL_LESSONS.length) * 100) };
}

export function nextLesson(s: ProgressState): Lesson | undefined {
  return ALL_LESSONS.find((l) => !s.completedLessons[l.id]);
}

export function quizPct(s: ProgressState, lessonId: string): number | null {
  const q = s.quizzes[lessonId];
  return q && q.total ? Math.round((q.best / q.total) * 100) : null;
}

/** Lessons whose best quiz score is below 70%: good candidates for review. */
export function lessonsToReview(s: ProgressState): Lesson[] {
  return ALL_LESSONS.filter((l) => {
    const p = quizPct(s, l.id);
    return p !== null && p < 70;
  });
}

export interface SkillStatus {
  module: Module;
  avgQuiz: number | null;
  lessonsDone: number;
  status: 'mastered' | 'progressing' | 'needs-work' | 'not-started';
}

export function skillStatuses(s: ProgressState): SkillStatus[] {
  return MODULES.map((m) => {
    const scores = m.lessons.map((l) => quizPct(s, l.id)).filter((x): x is number => x !== null);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const done = m.lessons.filter((l) => s.completedLessons[l.id]).length;
    let status: SkillStatus['status'] = 'not-started';
    if (avg !== null && avg < 60) status = 'needs-work';
    else if (done === m.lessons.length && (avg ?? 0) >= 80) status = 'mastered';
    else if (done > 0 || avg !== null) status = 'progressing';
    return { module: m, avgQuiz: avg, lessonsDone: done, status };
  });
}

// ----- Weekly challenge -----------------------------------------------------

export function weekKey(d = new Date()): string {
  // ISO week number
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Three exercises chosen deterministically for the week, drawn from the modules the
 * learner has reached (completed modules + the current one), so the challenge is
 * always attemptable.
 */
export function weeklyChallenge(s: ProgressState, wk = weekKey()): Exercise[] {
  const reachedModules: Module[] = [];
  for (const m of MODULES) {
    reachedModules.push(m);
    if (!moduleComplete(m, s)) break;
  }
  const pool = reachedModules.flatMap((m) => m.lessons.flatMap((l) => l.exercises)).filter((e) => !e.accepted);
  if (!pool.length) return [];
  const picked: Exercise[] = [];
  let h = hash(wk);
  while (picked.length < Math.min(3, pool.length)) {
    const e = pool[h % pool.length];
    if (!picked.includes(e)) picked.push(e);
    h = hash(String(h));
  }
  return picked;
}
