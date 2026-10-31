import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { notify } from './notify';
import { defaults, sanitize, STORAGE_KEY, transitions as t, withBadges, type ProgressState, type Settings } from './progress-state';

export * from './progress-state';

function load(): ProgressState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? sanitize(JSON.parse(s)) : defaults();
  } catch {
    return defaults();
  }
}

interface Actions {
  completeLesson(id: string): void;
  uncompleteLesson(id: string): void;
  recordQuiz(lessonId: string, correct: number, total: number, wrongIds: string[]): void;
  solveExercise(id: string): void;
  setProjectStep(projectId: string, step: number, done: boolean): void;
  setProjectNotes(projectId: string, notes: string): void;
  completeProject(projectId: string, done: boolean): void;
  recordCheckpoint(moduleId: string, correct: number, total: number): void;
  completeWeekly(weekKey: string): void;
  toggleBookmark(lessonId: string): void;
  setNote(lessonId: string, text: string): void;
  visitLesson(id: string): void;
  updateSettings(p: Partial<Settings>): void;
  importState(json: string): void;
  reset(): void;
}

const Ctx = createContext<{ state: ProgressState; actions: Actions } | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      notify({ kind: 'error', text: 'Could not save progress (browser storage is full or blocked).' });
    }
  }, [state]);

  // Theme
  useEffect(() => {
    const apply = () => {
      const t = state.settings.theme;
      const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [state.settings.theme]);

  const update = useCallback((fn: (s: ProgressState) => ProgressState) => setState((s) => withBadges(fn(s))), []);

  const actions = useMemo<Actions>(
    () => ({
      completeLesson: (id) => update((s) => t.completeLesson(s, id)),
      uncompleteLesson: (id) => update((s) => t.uncompleteLesson(s, id)),
      recordQuiz: (lessonId, correct, total, wrongIds) => update((s) => t.recordQuiz(s, lessonId, correct, total, wrongIds)),
      solveExercise: (id) => update((s) => t.solveExercise(s, id)),
      setProjectStep: (pid, step, done) => update((s) => t.setProjectStep(s, pid, step, done)),
      setProjectNotes: (pid, notes) => setState((s) => t.setProjectNotes(s, pid, notes)),
      completeProject: (pid, done) => update((s) => t.completeProject(s, pid, done)),
      recordCheckpoint: (mid, correct, total) => update((s) => t.recordCheckpoint(s, mid, correct, total)),
      completeWeekly: (wk) => update((s) => t.completeWeekly(s, wk)),
      toggleBookmark: (id) => setState((s) => t.toggleBookmark(s, id)),
      setNote: (id, text) => setState((s) => t.setNote(s, id, text)),
      visitLesson: (id) => setState((s) => (s.lastLesson === id ? s : { ...s, lastLesson: id })),
      updateSettings: (p) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } })),
      importState: (json) => {
        const parsed = JSON.parse(json);
        if (!parsed || parsed.version !== 1) throw new Error('This file is not a DataScience Academy progress export.');
        setState(sanitize(parsed));
      },
      reset: () => setState(defaults()),
    }),
    [update],
  );

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}
