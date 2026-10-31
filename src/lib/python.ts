// Main-thread client for the Pyodide worker.
import { useSyncExternalStore } from 'react';

export type OutputItem =
  | { kind: 'stdout' | 'stderr' | 'error' | 'text'; text: string }
  | { kind: 'image'; png: string }
  | { kind: 'html'; html: string };

export interface RunResult {
  ok: boolean;
  error?: string | null;
  /** undefined when no tests were run; null when tests passed; string = failure message. */
  testError?: string | null;
  output: OutputItem[];
}

export interface RunOptions {
  stdin?: string;
  tests?: string;
  /** Persistent namespace (like a notebook kernel). Omit for a fresh run. */
  namespace?: string;
  onOutput?: (item: OutputItem) => void;
  timeoutMs?: number;
}

type Status = { status: 'idle' | 'loading' | 'ready' | 'running' | 'packages' | 'error'; detail?: string };

let worker: Worker | null = null;
let status: Status = { status: 'idle' };
const statusListeners = new Set<() => void>();
let nextId = 1;
const pending = new Map<number, { resolve: (r: RunResult) => void; output: OutputItem[]; onOutput?: (o: OutputItem) => void; timer?: number }>();

function setStatus(s: Status) {
  status = s;
  statusListeners.forEach((l) => l());
}

function spawn() {
  worker = new Worker(new URL('../workers/python.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (ev) => {
    const m = ev.data;
    if (m.type === 'status') return setStatus({ status: m.status, detail: m.detail });
    const p = pending.get(m.id);
    if (!p) return;
    const push = (o: OutputItem) => {
      p.output.push(o);
      p.onOutput?.(o);
    };
    if (m.type === 'stdout' || m.type === 'stderr') push({ kind: m.type, text: m.text });
    else if (m.type === 'image') push({ kind: 'image', png: m.png });
    else if (m.type === 'display') push(m.kind === 'html' ? { kind: 'html', html: m.value } : { kind: 'text', text: m.value });
    else if (m.type === 'done') {
      if (m.error) push({ kind: 'error', text: m.error });
      clearTimeout(p.timer);
      pending.delete(m.id);
      p.resolve({ ok: !m.error, error: m.error, testError: m.testError, output: p.output });
    }
  };
  worker.onerror = () => setStatus({ status: 'error', detail: 'The Python worker crashed. Press Stop to restart it.' });
  worker.postMessage({ type: 'init' });
}

export function ensurePython() {
  if (!worker) spawn();
}

/** Terminates the worker (the only way to stop an infinite loop) and starts a fresh one. */
export function restartPython(reason = 'Execution stopped.') {
  worker?.terminate();
  worker = null;
  for (const [, p] of pending) {
    clearTimeout(p.timer);
    p.output.push({ kind: 'error', text: reason });
    p.resolve({ ok: false, error: reason, testError: reason, output: p.output });
  }
  pending.clear();
  setStatus({ status: 'idle' });
  spawn();
}

export function runPython(code: string, opts: RunOptions = {}): Promise<RunResult> {
  ensurePython();
  const id = nextId++;
  return new Promise((resolve) => {
    const entry = { resolve, output: [] as OutputItem[], onOutput: opts.onOutput, timer: undefined as number | undefined };
    pending.set(id, entry);
    // The timeout only starts counting once the runtime is ready (first load can take a while).
    const arm = () => {
      entry.timer = window.setTimeout(() => {
        if (status.status === 'running' && pending.has(id))
          restartPython(`Stopped after ${(opts.timeoutMs ?? 60000) / 1000}s. Check for an infinite loop (e.g. a while loop whose condition never becomes False).`);
        else if (pending.has(id)) arm();
      }, opts.timeoutMs ?? 60000);
    };
    arm();
    worker!.postMessage({ type: 'run', id, code, stdin: opts.stdin, tests: opts.tests, namespace: opts.namespace });
  });
}

export function resetNamespace(namespace: string) {
  worker?.postMessage({ type: 'reset', namespace });
}

export function usePythonStatus(): Status {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l);
      return () => statusListeners.delete(l);
    },
    () => status,
  );
}
