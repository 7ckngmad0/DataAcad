export interface Toast {
  id: number;
  kind: 'xp' | 'badge' | 'info' | 'error';
  text: string;
}

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();
let nextId = 1;

export function notify(t: Omit<Toast, 'id'>) {
  const toast = { ...t, id: nextId++ };
  // Defer so notifications raised inside React state updaters don't trigger renders mid-update.
  queueMicrotask(() => listeners.forEach((l) => l(toast)));
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
