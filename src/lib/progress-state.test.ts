import { describe, expect, it } from 'vitest';
import { MODULES } from '../content';
import { computeStreak, defaults, sanitize, today, transitions as t, withBadges, XP, type ProgressState } from './progress-state';
import { lessonsToReview, moduleComplete, skillStatuses, weekKey, weeklyChallenge } from './gamification';

const daysAgo = (n: number, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return today(d);
};

describe('XP awards', () => {
  it('awards lesson XP once and records today as an activity day', () => {
    let s = t.completeLesson(defaults(), 'l1');
    s = t.completeLesson(s, 'l1');
    expect(s.xp).toBe(XP.lesson);
    expect(s.xpByDay[today()]).toBe(XP.lesson);
    expect(s.activityDays).toEqual([today()]);
  });

  it('awards exercise XP once per exercise', () => {
    let s = t.solveExercise(defaults(), 'e1');
    s = t.solveExercise(s, 'e1');
    s = t.solveExercise(s, 'e2');
    expect(s.xp).toBe(2 * XP.exercise);
  });

  it('gives quiz XP only for improvement over the previous best', () => {
    let s = t.recordQuiz(defaults(), 'l1', 3, 5, ['q4', 'q5']);
    expect(s.xp).toBe(3 * XP.quizPerCorrect);
    s = t.recordQuiz(s, 'l1', 2, 5, []); // worse retake
    expect(s.xp).toBe(3 * XP.quizPerCorrect);
    expect(s.quizzes.l1).toMatchObject({ best: 3, last: 2, attempts: 2 });
    s = t.recordQuiz(s, 'l1', 5, 5, []); // perfect: +2 correct and the bonus
    expect(s.xp).toBe(5 * XP.quizPerCorrect + XP.quizPerfect);
    s = t.recordQuiz(s, 'l1', 5, 5, []); // repeating a perfect score earns nothing
    expect(s.xp).toBe(5 * XP.quizPerCorrect + XP.quizPerfect);
  });

  it('counts a zero-XP quiz attempt as activity', () => {
    const s = t.recordQuiz(defaults(), 'l1', 0, 5, []);
    expect(s.xp).toBe(0);
    expect(s.activityDays).toContain(today());
  });

  it('awards checkpoint, project and weekly XP without double counting', () => {
    let s = t.recordCheckpoint(defaults(), 'm', 8, 12);
    s = t.recordCheckpoint(s, 'm', 10, 12);
    expect(s.xp).toBe(10 * XP.checkpointPerCorrect);
    s = t.completeProject(s, 'p', true);
    s = t.completeProject(s, 'p', true);
    s = t.completeWeekly(s, '2026-W44');
    s = t.completeWeekly(s, '2026-W44');
    expect(s.xp).toBe(10 * XP.checkpointPerCorrect + XP.project + XP.weekly);
  });

  it('un-completing a project keeps its steps and notes', () => {
    let s = t.setProjectStep(defaults(), 'p', 0, true);
    s = t.setProjectNotes(s, 'p', 'notes');
    s = t.completeProject(s, 'p', true);
    s = t.completeProject(s, 'p', false);
    expect(s.projects.p).toEqual({ steps: { 0: true }, notes: 'notes', completed: undefined });
  });
});

describe('streaks', () => {
  const now = new Date(2026, 9, 31, 12);
  it('counts consecutive days ending today', () => {
    expect(computeStreak([daysAgo(0, now), daysAgo(1, now), daysAgo(2, now), daysAgo(4, now)], now)).toBe(3);
  });
  it('survives until the end of today if yesterday was active', () => {
    expect(computeStreak([daysAgo(1, now), daysAgo(2, now)], now)).toBe(2);
  });
  it('breaks after a missed day', () => {
    expect(computeStreak([daysAgo(2, now), daysAgo(3, now)], now)).toBe(0);
  });
  it('handles month boundaries', () => {
    const nov1 = new Date(2026, 10, 1, 9);
    expect(computeStreak(['2026-11-01', '2026-10-31', '2026-10-30'], nov1)).toBe(3);
  });
});

describe('badges', () => {
  it('unlocks the first-lesson badge exactly once', () => {
    const s = withBadges(t.completeLesson(defaults(), 'x'));
    expect(s.badges['first-lesson']).toBeTruthy();
    expect(withBadges(s)).toBe(s); // no change -> same object
  });

  it('awards a module badge only when every lesson in that module is complete', () => {
    const m = MODULES[0];
    let s = defaults();
    for (const l of m.lessons.slice(0, -1)) s = t.completeLesson(s, l.id);
    expect(withBadges(s).badges[`module-${m.id}`]).toBeUndefined();
    s = withBadges(t.completeLesson(s, m.lessons.at(-1)!.id));
    expect(s.badges[`module-${m.id}`]).toBeTruthy();
  });

  it('treats a module with no lessons as not complete', () => {
    expect(moduleComplete({ ...MODULES[0], lessons: [] }, defaults())).toBe(false);
  });
});

describe('sanitize (import / old saves)', () => {
  it('returns defaults for junk', () => {
    expect(sanitize(null)).toEqual(defaults());
    expect(sanitize('nope')).toEqual(defaults());
    expect(sanitize([1, 2])).toEqual(defaults());
  });
  it('keeps valid fields and repairs malformed ones', () => {
    const s = sanitize({ version: 1, xp: -5, completedLessons: { a: 'x' }, exercises: 'bad', activityDays: ['2026-01-01', 3], settings: { name: 'Ana' } });
    expect(s.xp).toBe(0);
    expect(s.completedLessons).toEqual({ a: 'x' });
    expect(s.exercises).toEqual({});
    expect(s.activityDays).toEqual(['2026-01-01']);
    expect(s.settings).toMatchObject({ name: 'Ana', dailyGoalXp: 100, theme: 'system' });
  });
});

describe('recommendations and weekly challenge', () => {
  it('flags lessons with a best quiz score under 70% for review', () => {
    const [a, b] = MODULES[0].lessons;
    let s = t.recordQuiz(defaults(), a.id, 2, 5, []);
    s = t.recordQuiz(s, b.id, 4, 5, []);
    expect(lessonsToReview(s).map((l) => l.id)).toEqual([a.id]);
  });

  it('classifies skills from quiz averages and completion', () => {
    const m = MODULES[0];
    let s: ProgressState = defaults();
    expect(skillStatuses(s)[0].status).toBe('not-started');
    s = t.recordQuiz(s, m.lessons[0].id, 1, 5, []);
    expect(skillStatuses(s)[0].status).toBe('needs-work');
    s = defaults();
    for (const l of m.lessons) s = t.recordQuiz(t.completeLesson(s, l.id), l.id, 5, 5, []);
    expect(skillStatuses(s)[0].status).toBe('mastered');
  });

  it('computes ISO week keys, including the year boundary', () => {
    expect(weekKey(new Date(2026, 9, 31))).toBe('2026-W44');
    expect(weekKey(new Date(2027, 0, 1))).toBe('2026-W53');
    expect(weekKey(new Date(2025, 11, 29))).toBe('2026-W01');
  });

  it('picks the same 3 distinct exercises for a week, from reached modules only', () => {
    const s = defaults();
    const a = weeklyChallenge(s, '2026-W44');
    expect(a).toHaveLength(3);
    expect(new Set(a.map((e) => e.id)).size).toBe(3);
    expect(weeklyChallenge(s, '2026-W44').map((e) => e.id)).toEqual(a.map((e) => e.id));
    const firstModuleIds = new Set(MODULES[0].lessons.flatMap((l) => l.exercises.map((e) => e.id)));
    expect(a.every((e) => firstModuleIds.has(e.id))).toBe(true);
    expect(a.every((e) => !e.accepted)).toBe(true);
  });
});

describe('bookmarks and notes', () => {
  it('toggles a bookmark on and off', () => {
    let s = t.toggleBookmark(defaults(), 'l1');
    expect(s.bookmarks.l1).toBeTruthy();
    s = t.toggleBookmark(s, 'l1');
    expect(s.bookmarks).toEqual({});
  });
  it('stores notes and removes blank ones', () => {
    let s = t.setNote(defaults(), 'l1', 'mean is sensitive to outliers');
    expect(s.notes.l1).toBe('mean is sensitive to outliers');
    s = t.setNote(s, 'l1', '   ');
    expect(s.notes).toEqual({});
  });
  it('keeps notes and bookmarks through export/import', () => {
    const s = t.setNote(t.toggleBookmark(defaults(), 'l1'), 'l1', 'hi');
    const back = sanitize(JSON.parse(JSON.stringify(s)));
    expect(back.notes).toEqual({ l1: 'hi' });
    expect(Object.keys(back.bookmarks)).toEqual(['l1']);
  });
});
