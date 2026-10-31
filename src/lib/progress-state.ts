// Progress state and its transitions as plain functions (no React), so XP, streak and
// badge rules can be unit-tested. ProgressProvider in progress.tsx wires them to React state.
import { BADGES } from './gamification';
import { notify } from './notify';

export const STORAGE_KEY = 'dsa-progress-v1';

export interface QuizRecord {
  best: number; // best number correct
  last: number;
  total: number;
  attempts: number;
  wrongIds: string[]; // question ids missed on the last attempt
  date: string;
}

export interface ProjectRecord {
  steps: Record<number, boolean>;
  notes: string;
  completed?: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  dailyGoalXp: number;
  name: string;
  editorFontSize: number;
}

export interface ProgressState {
  version: 1;
  completedLessons: Record<string, string>;
  quizzes: Record<string, QuizRecord>;
  exercises: Record<string, string>;
  projects: Record<string, ProjectRecord>;
  checkpoints: Record<string, { best: number; total: number; date: string }>;
  weekly: Record<string, string>; // weekKey -> date completed
  badges: Record<string, string>;
  xp: number;
  xpByDay: Record<string, number>;
  activityDays: string[];
  bookmarks: Record<string, string>; // lessonId -> date bookmarked
  notes: Record<string, string>; // lessonId -> the learner's own notes (markdown)
  lastLesson?: string;
  settings: Settings;
}

export const XP = { lesson: 50, exercise: 20, quizPerCorrect: 10, quizPerfect: 25, checkpointPerCorrect: 15, project: 200, weekly: 150 };

export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const defaults = (): ProgressState => ({
  version: 1,
  completedLessons: {},
  quizzes: {},
  exercises: {},
  projects: {},
  checkpoints: {},
  weekly: {},
  badges: {},
  xp: 0,
  xpByDay: {},
  activityDays: [],
  bookmarks: {},
  notes: {},
  settings: { theme: 'system', dailyGoalXp: 100, name: '', editorFontSize: 14 },
});

const isRecord = (v: unknown): v is Record<string, never> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Fills in missing fields and drops malformed ones, e.g. from an old or hand-edited export. */
export function sanitize(raw: unknown): ProgressState {
  const base = defaults();
  if (!isRecord(raw)) return base;
  const r = raw as Partial<ProgressState>;
  const obj = <K extends keyof ProgressState>(k: K) => (isRecord(r[k]) ? r[k] : base[k]) as ProgressState[K];
  return {
    ...base,
    completedLessons: obj('completedLessons'),
    quizzes: obj('quizzes'),
    exercises: obj('exercises'),
    projects: obj('projects'),
    checkpoints: obj('checkpoints'),
    weekly: obj('weekly'),
    badges: obj('badges'),
    xpByDay: obj('xpByDay'),
    bookmarks: obj('bookmarks'),
    notes: obj('notes'),
    lastLesson: typeof r.lastLesson === 'string' ? r.lastLesson : undefined,
    settings: { ...base.settings, ...(isRecord(r.settings) ? r.settings : {}) },
    activityDays: Array.isArray(r.activityDays) ? r.activityDays.filter((d) => typeof d === 'string') : [],
    xp: typeof r.xp === 'number' && r.xp >= 0 ? r.xp : 0,
  };
}

export function computeStreak(days: string[], now = new Date()): number {
  const set = new Set(days);
  const d = new Date(now);
  if (!set.has(today(d))) d.setDate(d.getDate() - 1); // streak survives until the end of today
  let streak = 0;
  while (set.has(today(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function award(s: ProgressState, amount: number, reason: string): ProgressState {
  const day = today();
  const activityDays = s.activityDays.includes(day) ? s.activityDays : [...s.activityDays, day];
  if (amount <= 0) return { ...s, activityDays };
  notify({ kind: 'xp', text: `+${amount} XP · ${reason}` });
  return {
    ...s,
    xp: s.xp + amount,
    xpByDay: { ...s.xpByDay, [day]: (s.xpByDay[day] || 0) + amount },
    activityDays,
  };
}

export function withBadges(s: ProgressState): ProgressState {
  let badges = s.badges;
  for (const b of BADGES) {
    if (!badges[b.id] && b.check(s)) {
      badges = { ...badges, [b.id]: new Date().toISOString() };
      notify({ kind: 'badge', text: `Badge unlocked: ${b.title}` });
    }
  }
  return badges === s.badges ? s : { ...s, badges };
}

const now = () => new Date().toISOString();

/** Every state change the app makes. Badge checks are applied by the caller (see withBadges). */
export const transitions = {
  completeLesson(s: ProgressState, id: string): ProgressState {
    if (s.completedLessons[id]) return s;
    return award({ ...s, completedLessons: { ...s.completedLessons, [id]: now() } }, XP.lesson, 'Lesson completed');
  },
  uncompleteLesson(s: ProgressState, id: string): ProgressState {
    const { [id]: _, ...rest } = s.completedLessons;
    return { ...s, completedLessons: rest };
  },
  recordQuiz(s: ProgressState, lessonId: string, correct: number, total: number, wrongIds: string[]): ProgressState {
    const prev = s.quizzes[lessonId];
    const prevBest = prev?.best ?? 0;
    const rec: QuizRecord = { best: Math.max(prevBest, correct), last: correct, total, attempts: (prev?.attempts ?? 0) + 1, wrongIds, date: now() };
    // XP only for answers beyond your previous best, so retaking a quiz can't farm XP.
    let xp = Math.max(0, correct - prevBest) * XP.quizPerCorrect;
    if (correct === total && prevBest < total) xp += XP.quizPerfect;
    return award({ ...s, quizzes: { ...s.quizzes, [lessonId]: rec } }, xp, correct === total ? 'Perfect quiz!' : 'Quiz progress');
  },
  solveExercise(s: ProgressState, id: string): ProgressState {
    if (s.exercises[id]) return s;
    return award({ ...s, exercises: { ...s.exercises, [id]: now() } }, XP.exercise, 'Exercise solved');
  },
  setProjectStep(s: ProgressState, pid: string, step: number, done: boolean): ProgressState {
    const p = s.projects[pid] || { steps: {}, notes: '' };
    return { ...s, projects: { ...s.projects, [pid]: { ...p, steps: { ...p.steps, [step]: done } } } };
  },
  setProjectNotes(s: ProgressState, pid: string, notes: string): ProgressState {
    const p = s.projects[pid] || { steps: {}, notes: '' };
    return { ...s, projects: { ...s.projects, [pid]: { ...p, notes } } };
  },
  completeProject(s: ProgressState, pid: string, done: boolean): ProgressState {
    const p = s.projects[pid] || { steps: {}, notes: '' };
    if (!done) return { ...s, projects: { ...s.projects, [pid]: { ...p, completed: undefined } } };
    if (p.completed) return s;
    return award({ ...s, projects: { ...s.projects, [pid]: { ...p, completed: now() } } }, XP.project, 'Project completed');
  },
  recordCheckpoint(s: ProgressState, mid: string, correct: number, total: number): ProgressState {
    const prev = s.checkpoints[mid];
    const gained = Math.max(0, correct - (prev?.best ?? 0)) * XP.checkpointPerCorrect;
    const next = { ...s, checkpoints: { ...s.checkpoints, [mid]: { best: Math.max(prev?.best ?? 0, correct), total, date: now() } } };
    return award(next, gained, 'Checkpoint');
  },
  completeWeekly(s: ProgressState, wk: string): ProgressState {
    return s.weekly[wk] ? s : award({ ...s, weekly: { ...s.weekly, [wk]: now() } }, XP.weekly, 'Weekly challenge');
  },
  toggleBookmark(s: ProgressState, lessonId: string): ProgressState {
    const { [lessonId]: had, ...rest } = s.bookmarks;
    return { ...s, bookmarks: had ? rest : { ...s.bookmarks, [lessonId]: now() } };
  },
  setNote(s: ProgressState, lessonId: string, text: string): ProgressState {
    const { [lessonId]: _, ...rest } = s.notes;
    return { ...s, notes: text.trim() ? { ...s.notes, [lessonId]: text } : rest };
  },
};
