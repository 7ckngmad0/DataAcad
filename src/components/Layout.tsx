import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, BookOpen, Dumbbell, Code2, FolderKanban, Bot, Trophy, Settings, Menu, X, Flame, Sparkles, Sun, Moon, Search, NotebookPen,
} from 'lucide-react';
import { computeStreak, today, useProgress } from '../lib/progress';
import { subscribe, type Toast } from '../lib/notify';
import { useIsDark } from '../lib/useIsDark';
import { SearchDialog } from './SearchDialog';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/roadmap', label: 'Learning Roadmap', icon: Map },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/practice', label: 'Practice Exercises', icon: Dumbbell },
  { to: '/playground', label: 'Coding Playground', icon: Code2 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tutor', label: 'AI Tutor', icon: Bot },
  { to: '/notes', label: 'Notes & Bookmarks', icon: NotebookPen },
  { to: '/progress', label: 'Progress & Achievements', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(
    () =>
      subscribe((t) => {
        setToasts((cur) => (cur.some((c) => c.text === t.text) ? cur : [...cur, t])); // de-duplicate
        setTimeout(() => setToasts((cur) => cur.filter((c) => c.id !== t.id)), 3500);
      }),
    [],
  );
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            t.kind === 'badge' ? 'bg-amber-500 text-white' : t.kind === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          }`}
        >
          {t.kind === 'badge' ? '🏅' : t.kind === 'xp' ? <Sparkles size={16} /> : null} {t.text}
        </div>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state, actions } = useProgress();
  const loc = useLocation();
  const streak = computeStreak(state.activityDays);
  const todayXp = state.xpByDay[today()] || 0;
  const goal = state.settings.dailyGoalXp;
  const dark = useIsDark();

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!loc.hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Pages load lazily, so wait (briefly) for the #section to exist before scrolling to it.
    const id = decodeURIComponent(loc.hash.slice(1));
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) {
        clearInterval(t);
        el?.scrollIntoView();
      }
    }, 75);
    return () => clearInterval(t);
  }, [loc.pathname, loc.hash, loc.key]);

  // Ctrl/Cmd+K anywhere, or "/" when not typing, opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <div>
            <div className="font-bold leading-tight text-slate-900 dark:text-white">DataScience</div>
            <div className="text-xs font-medium leading-tight text-indigo-600 dark:text-indigo-400">Academy</div>
          </div>
          <button className="btn-ghost ml-auto !p-1.5 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <button
          className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:border-indigo-300 hover:text-slate-700 dark:border-slate-700 dark:hover:text-slate-300"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={16} /> Search
          <kbd className="ml-auto rounded border border-slate-300 px-1.5 text-[10px] dark:border-slate-600">Ctrl K</kbd>
        </button>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-orange-600"><Flame size={14} /> {streak}-day streak</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{state.xp} XP</span>
          </div>
          <div className="mt-2 text-slate-500">Today: {todayXp}/{goal} XP</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (todayXp / goal) * 100)}%` }} />
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/80">
          <button className="btn-ghost !p-1.5" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span className="font-semibold">DataScience Academy</span>
          <button className="btn-ghost ml-auto !p-1.5" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={19} />
          </button>
          <span className="flex items-center gap-1 text-sm font-semibold text-orange-600"><Flame size={15} /> {streak}</span>
        </header>
        <button
          className="btn-ghost fixed top-3 right-4 z-20 hidden !p-2 lg:inline-flex"
          onClick={() => actions.updateSettings({ theme: dark ? 'light' : 'dark' })}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
    </div>
  );
}
