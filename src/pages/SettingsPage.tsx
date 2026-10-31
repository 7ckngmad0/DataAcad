import { useEffect, useRef, useState } from 'react';
import { Download, Upload, Trash2, Sun, Moon, Monitor } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { notify } from '../lib/notify';
import { PageHeader } from '../components/ui';

export function SettingsPage() {
  const { state, actions } = useProgress();
  const s = state.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [tutor, setTutor] = useState<string>('checking…');

  useEffect(() => {
    fetch('/api/tutor/status')
      .then((r) => r.json())
      .then((j) => setTutor(j.configured ? `Connected (model: ${j.model})` : 'Not configured — add ANTHROPIC_API_KEY to .env and restart the server'))
      .catch(() => setTutor('Server not reachable'));
  }, []);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `datascience-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (f: File) => {
    try {
      actions.importState(await f.text());
      notify({ kind: 'info', text: 'Progress imported' });
    } catch (e) {
      notify({ kind: 'error', text: (e as Error).message });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" />
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Profile & goals</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Your name (shown on the dashboard)</span>
          <input className="input" value={s.name} onChange={(e) => actions.updateSettings({ name: e.target.value })} placeholder="e.g. Jan" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Daily XP goal: {s.dailyGoalXp} XP</span>
          <input type="range" min={30} max={400} step={10} value={s.dailyGoalXp} onChange={(e) => actions.updateSettings({ dailyGoalXp: Number(e.target.value) })} className="w-full" />
          <span className="text-xs text-slate-500">≈ {Math.max(1, Math.round(s.dailyGoalXp / 90))} lesson(s) with quiz and exercises per day.</span>
        </label>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {([['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'System']] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => actions.updateSettings({ theme: v })} className={`btn flex-1 border ${s.theme === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'border-slate-300 dark:border-slate-700'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Code editor font size: {s.editorFontSize}px</span>
          <input type="range" min={11} max={20} value={s.editorFontSize} onChange={(e) => actions.updateSettings({ editorFontSize: Number(e.target.value) })} className="w-full" />
        </label>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">AI tutor</h2>
        <p className="text-sm">Status: <b>{tutor}</b></p>
        <p className="text-sm text-slate-500">The API key is configured on the server in <code>.env</code> (never in the browser). See README.md for setup.</p>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-slate-500">Progress is saved automatically in this browser (localStorage). Export a backup regularly, or to move to another computer/browser.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={exportData}><Download size={16} /> Export progress</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><Upload size={16} /> Import progress</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <button
            className="btn ml-auto border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
            onClick={() => {
              if (confirm('Reset ALL progress (lessons, XP, badges, projects)? This cannot be undone. Consider exporting first.')) {
                actions.reset();
                notify({ kind: 'info', text: 'Progress reset' });
              }
            }}
          >
            <Trash2 size={16} /> Reset progress
          </button>
        </div>
      </section>
    </div>
  );
}
