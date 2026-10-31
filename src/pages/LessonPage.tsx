import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle2, Target, BookOpen, MessageCircle, Cpu, Tags, Globe, ListOrdered, Code2,
  AlertTriangle, Dumbbell, HelpCircle, ClipboardList, ExternalLink, Bot, ChevronDown, Wand2, Bookmark, BookmarkCheck, NotebookPen,
} from 'lucide-react';
import { getModule, neighbours, lessonPath } from '../content';
import { useProgress } from '../lib/progress';
import { Markdown } from '../components/Markdown';
import { CodeRunner } from '../components/CodeRunner';
import { CodeEditor } from '../components/CodeEditor';
import { ExerciseCard } from '../components/ExerciseCard';
import { Quiz } from '../components/Quiz';
import { DifficultyChip } from '../components/ui';
import { WIDGETS } from '../components/widgets';
import type { CodeExample, Lesson } from '../types';

const SECTIONS = [
  ['objectives', 'Learning objectives', Target],
  ['intro', 'Introduction', BookOpen],
  ['simple', 'In simple English', MessageCircle],
  ['technical', 'Technical explanation', Cpu],
  ['terms', 'Key terminology', Tags],
  ['real-world', 'Real-world example', Globe],
  ['steps', 'Step-by-step', ListOrdered],
  ['interactive', 'Interactive demo', Wand2],
  ['code', 'Code examples', Code2],
  ['mistakes', 'Common mistakes', AlertTriangle],
  ['exercises', 'Practice exercises', Dumbbell],
  ['quiz', 'Knowledge check', HelpCircle],
  ['summary', 'Summary', ClipboardList],
  ['notes', 'My notes', NotebookPen],
  ['resources', 'Resources', ExternalLink],
] as const;

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof Target; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="section-title"><Icon size={19} className="text-indigo-500" /> {title}</h2>
      {children}
    </section>
  );
}

const CONTINUATION = '…';

/**
 * Explanations are written one per non-blank code line, where "…" means "continues the
 * explanation above". When the counts line up we pair every code line with its explanation
 * (true line-by-line view); otherwise we fall back to numbered steps without placeholders.
 */
function explanationGroups(ex: CodeExample): { lines: string[]; text: string }[] | null {
  const lines = ex.code.split('\n').filter((s) => s.trim() !== '');
  if (lines.length !== ex.explanation.length) return null;
  const groups: { lines: string[]; text: string }[] = [];
  lines.forEach((line, k) => {
    const text = ex.explanation[k];
    if (text === CONTINUATION && groups.length) groups[groups.length - 1].lines.push(line);
    else groups.push({ lines: [line], text: text === CONTINUATION ? '' : text });
  });
  return groups;
}

function LineByLine({ ex }: { ex: CodeExample }) {
  const groups = explanationGroups(ex);
  if (!groups) {
    const steps = ex.explanation.filter((e) => e !== CONTINUATION);
    return (
      <ol className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
        {steps.map((e, j) => (
          <li key={j} className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">{j + 1}</span>
            <Markdown>{e}</Markdown>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
      {groups.map((g, j) => (
        <div key={j} className="grid gap-2 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] dark:bg-slate-800/40">
          <pre className="overflow-x-auto whitespace-pre font-mono text-[12.5px] text-slate-800 dark:text-slate-100">{g.lines.join('\n')}</pre>
          <div className="text-slate-600 dark:text-slate-300">{g.text ? <Markdown>{g.text}</Markdown> : null}</div>
        </div>
      ))}
    </div>
  );
}

function CodeExampleBlock({ ex, i }: { ex: CodeExample; i: number }) {
  const [open, setOpen] = useState(true);
  const runnable = ex.runnable !== false;
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Example {i + 1}: {ex.title}</div>
      {ex.expectsError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          This example raises an error <b>on purpose</b>. Run it and practise reading the traceback from the bottom up.
        </p>
      )}
      {runnable ? (
        <CodeRunner code={ex.code} lang={ex.lang ?? 'python'} db={ex.db} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-slate-700 dark:bg-amber-950/40 dark:text-amber-200">
            Read-only: this example needs software that can’t run in the browser (run it in Jupyter/Colab on your computer).
          </div>
          <CodeEditor value={ex.code} lang={ex.lang ?? 'python'} readOnly />
        </div>
      )}
      <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400" onClick={() => setOpen((o) => !o)}>
        <ChevronDown size={16} className={`transition ${open ? '' : '-rotate-90'}`} /> {explanationGroups(ex) ? 'Line-by-line explanation' : 'Step-by-step explanation'}
      </button>
      {open && <LineByLine ex={ex} />}
    </div>
  );
}

function Terms({ terms }: { terms: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {terms.map(([t, d], i) => (
        <button key={t} onClick={() => setOpen(open === i ? null : i)} className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-400 dark:border-slate-800">
          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
            {t} <ChevronDown size={15} className={`transition ${open === i ? 'rotate-180' : ''}`} />
          </div>
          {open === i ? <div className="mt-1 text-sm"><Markdown>{d}</Markdown></div> : <div className="mt-1 truncate text-sm text-slate-500">{d.replace(/[`*$]/g, '')}</div>}
        </button>
      ))}
    </div>
  );
}

function LessonNotes({ lessonId }: { lessonId: string }) {
  const { state, actions } = useProgress();
  const [text, setText] = useState(state.notes[lessonId] ?? '');
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pending = useRef<string | null>(null);
  // Save on a short debounce, and flush an unsaved edit when the learner navigates away.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pending.current !== null) actions.setNote(lessonId, pending.current);
    },
    [actions, lessonId],
  );
  const change = (v: string) => {
    setText(v);
    setSaved(false);
    pending.current = v;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      actions.setNote(lessonId, v);
      pending.current = null;
      setSaved(true);
    }, 500);
  };
  return (
    <div>
      <textarea
        className="input min-h-[120px]"
        aria-label="My notes for this lesson"
        placeholder="Write the key ideas in your own words, questions to ask the tutor, or code you want to remember…"
        value={text}
        onChange={(e) => change(e.target.value)}
      />
      <p className="mt-1 text-xs text-slate-500">
        {saved ? 'Saved' : 'Saving…'} · Notes are searchable, listed under <Link to="/notes" className="text-indigo-600 underline dark:text-indigo-400">Notes & Bookmarks</Link>, and included in your progress export.
      </p>
    </div>
  );
}

export function lessonContext(l: Lesson, moduleTitle: string) {
  return `Module: ${moduleTitle}\nLesson: ${l.title}\nObjectives: ${l.objectives.join('; ')}\nKey terms: ${l.terms.map((t) => t[0]).join(', ')}`;
}

export function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const m = getModule(moduleId!);
  const lesson = m?.lessons.find((l) => l.id === lessonId);
  const { state, actions } = useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    if (lesson) actions.visitLesson(lesson.id);
  }, [lesson, actions]);

  if (!m || !lesson) return <p>Lesson not found. <Link to="/courses" className="text-indigo-600">Back to courses</Link></p>;
  const { prev, next } = neighbours(lesson.id);
  const done = !!state.completedLessons[lesson.id];
  const idx = m.lessons.indexOf(lesson);
  const q = state.quizzes[lesson.id];
  const bookmarked = !!state.bookmarks[lesson.id];
  const ctx = lessonContext(lesson, m.title);
  const sections = SECTIONS.filter(([id]) => (id === 'interactive' ? lesson.widgets?.length : id === 'code' ? lesson.code.length : true));

  return (
    <div className="xl:grid xl:grid-cols-[1fr_210px] xl:gap-10">
      <article className="min-w-0 space-y-10">
        <header>
          <Link to={`/courses/${m.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
            <ChevronLeft size={16} /> Module {m.number}: {m.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Lesson {m.number}.{idx + 1}</span>
            <DifficultyChip d={lesson.difficulty} />
            <span className="flex items-center gap-1"><Clock size={14} /> {lesson.minutes} min</span>
            {lesson.optional && <span className="chip bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Optional specialization</span>}
            {done && <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 size={13} /> Completed</span>}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{lesson.title}</h1>
          <div className="mt-3 flex flex-wrap gap-1">
            <button
              className="btn-ghost !px-2 text-sm"
              onClick={() => navigate('/tutor', { state: { mode: 'explain', context: ctx, prompt: `I'm studying the lesson "${lesson.title}". ` } })}
            >
              <Bot size={16} /> Ask the AI tutor about this lesson
            </button>
            <button className="btn-ghost !px-2 text-sm" onClick={() => actions.toggleBookmark(lesson.id)} aria-pressed={bookmarked}>
              {bookmarked ? <BookmarkCheck size={16} className="text-amber-500" /> : <Bookmark size={16} />} {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
        </header>

        <Section id="objectives" title="Learning objectives" icon={Target}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {lesson.objectives.map((o) => (
              <li key={o} className="flex gap-2 rounded-xl bg-indigo-50/60 p-3 text-sm dark:bg-indigo-950/30">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-indigo-500" /> {o}
              </li>
            ))}
          </ul>
        </Section>
        <Section id="intro" title="Introduction" icon={BookOpen}><Markdown>{lesson.intro}</Markdown></Section>
        <Section id="simple" title="In simple English" icon={MessageCircle}>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/20"><Markdown>{lesson.simple}</Markdown></div>
        </Section>
        <Section id="technical" title="Technical explanation" icon={Cpu}><Markdown>{lesson.technical}</Markdown></Section>
        <Section id="terms" title="Key terminology" icon={Tags}><Terms terms={lesson.terms} /></Section>
        <Section id="real-world" title="Real-world example" icon={Globe}>
          <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900 dark:bg-sky-950/20"><Markdown>{lesson.realWorld}</Markdown></div>
        </Section>
        <Section id="steps" title="Step-by-step demonstration" icon={ListOrdered}>
          <ol className="space-y-3">
            {lesson.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{i + 1}</span>
                <Markdown className="pt-0.5">{s}</Markdown>
              </li>
            ))}
          </ol>
        </Section>
        {!!lesson.widgets?.length && (
          <Section id="interactive" title="Interactive demo" icon={Wand2}>
            <div className="space-y-6">
              {lesson.widgets.map((w) => {
                const W = WIDGETS[w];
                return <div key={w} className="card p-5"><W /></div>;
              })}
            </div>
          </Section>
        )}
        {lesson.code.length > 0 && (
          <Section id="code" title="Code examples" icon={Code2}>
            <p className="mb-4 text-sm text-slate-500">These run real Python (or SQLite) in your browser. Edit them, press <b>Run</b> (or Ctrl+Enter) and experiment — you can't break anything; the ↺ button restores the original.</p>
            <div className="space-y-8">{lesson.code.map((c, i) => <CodeExampleBlock key={i} ex={c} i={i} />)}</div>
          </Section>
        )}
        <Section id="mistakes" title="Common mistakes" icon={AlertTriangle}>
          <div className="space-y-3">
            {lesson.mistakes.map((mi, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-800">
                <div className="flex gap-2 text-sm"><span className="text-rose-500">✗</span><Markdown>{mi.mistake}</Markdown></div>
                <div className="flex gap-2 text-sm"><span className="text-emerald-500">✓</span><Markdown>{mi.fix}</Markdown></div>
              </div>
            ))}
          </div>
        </Section>
        <Section id="exercises" title="Practice exercises" icon={Dumbbell}>
          <div className="space-y-5">{lesson.exercises.map((e, i) => <ExerciseCard key={e.id} ex={e} index={i} context={ctx} />)}</div>
        </Section>
        <Section id="quiz" title="Knowledge check" icon={HelpCircle}>
          {q && <p className="mb-3 text-sm text-slate-500">Best score: {q.best}/{q.total} · attempts: {q.attempts}</p>}
          <Quiz questions={lesson.quiz} context={ctx} onSubmit={(c, t, w) => actions.recordQuiz(lesson.id, c, t, w)} />
        </Section>
        <Section id="summary" title="Lesson summary" icon={ClipboardList}>
          <ul className="space-y-2">
            {lesson.summary.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /><Markdown>{s}</Markdown></li>
            ))}
          </ul>
        </Section>
        <Section id="notes" title="My notes" icon={NotebookPen}>
          <LessonNotes key={lesson.id} lessonId={lesson.id} />
        </Section>
        <Section id="resources" title="Additional resources" icon={ExternalLink}>
          <ul className="space-y-1.5 text-sm">
            {lesson.resources.map((r) => (
              <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">{r.label} <ExternalLink size={12} /></a></li>
            ))}
          </ul>
        </Section>

        <footer className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          {done ? (
            <button className="btn-secondary" onClick={() => actions.uncompleteLesson(lesson.id)}>
              <CheckCircle2 size={16} className="text-emerald-500" /> Completed — mark as not done
            </button>
          ) : (
            <button
              className="btn-success"
              disabled={!q}
              title={q ? '' : 'Take the knowledge check first'}
              onClick={() => actions.completeLesson(lesson.id)}
            >
              <CheckCircle2 size={16} /> Mark lesson as complete (+50 XP)
            </button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            {prev && <Link to={lessonPath(prev.id)} className="btn-secondary"><ChevronLeft size={16} /> Previous</Link>}
            {next && <Link to={lessonPath(next.id)} className="btn-primary">Next lesson <ChevronRight size={16} /></Link>}
          </div>
        </footer>
        {!done && !q && (
          <p className="-mt-6 text-xs text-slate-500">
            Complete the <a href="#quiz" className="text-indigo-600 underline dark:text-indigo-400">knowledge check</a> (any score) to mark this lesson as complete. Aim for 80%+ — you can retake it.
          </p>
        )}
      </article>

      <nav className="hidden xl:block">
        <div className="sticky top-8 space-y-0.5 text-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">On this page</div>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">{label}</a>
          ))}
        </div>
      </nav>
    </div>
  );
}
