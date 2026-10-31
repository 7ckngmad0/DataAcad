import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, Bot, Copy, Download, Target, Briefcase, Database, Package, ListChecks, Award, FileText, Code2 } from 'lucide-react';
import { PROJECTS } from '../content';
import { useProgress } from '../lib/progress';
import { Markdown } from '../components/Markdown';
import { CodeRunner } from '../components/CodeRunner';
import { PageHeader, ProgressBar } from '../components/ui';
import { notify } from '../lib/notify';

function Block({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="section-title"><Icon size={18} className="text-indigo-500" /> {title}</h2>
      {children}
    </section>
  );
}

export function ProjectPage() {
  const { projectId } = useParams();
  const p = PROJECTS.find((x) => x.id === projectId);
  const { state, actions } = useProgress();
  const navigate = useNavigate();
  const [openStep, setOpenStep] = useState<number | null>(0);
  if (!p) return <p>Project not found. <Link to="/projects" className="text-indigo-600">Back</Link></p>;
  const rec = state.projects[p.id] || { steps: {}, notes: '' };
  const doneSteps = p.steps.filter((_, i) => rec.steps[i]).length;
  const allDone = doneSteps === p.steps.length;

  const downloadReport = () => {
    const blob = new Blob([rec.notes || p.reportTemplate], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${p.id}-report.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"><ChevronLeft size={16} /> All projects</Link>
      <PageHeader title={p.title} subtitle={`${p.level} · ~${p.hours} hours · ${p.skills.join(' · ')}`}>
        {rec.completed ? (
          <button className="btn-secondary" onClick={() => actions.completeProject(p.id, false)}><CheckCircle2 size={16} className="text-emerald-500" /> Completed</button>
        ) : (
          <button className="btn-success" disabled={!allDone} title={allDone ? '' : 'Finish all steps first'} onClick={() => actions.completeProject(p.id, true)}>
            <Award size={16} /> Mark project complete (+200 XP)
          </button>
        )}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block icon={Briefcase} title="Business problem"><Markdown>{p.businessProblem}</Markdown></Block>
        <Block icon={Target} title="Project objectives">
          <ul className="list-disc space-y-1 pl-5 text-sm">{p.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </Block>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block icon={Database} title={`Dataset: ${p.dataset.file}`}>
          <p className="text-sm text-slate-600 dark:text-slate-400">{p.dataset.description}</p>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {p.dataset.columns.map(([c, d]) => (
                <tr key={c} className="border-b border-slate-100 dark:border-slate-800"><td className="py-1 pr-3 font-mono text-xs">{c}</td><td className="py-1 text-slate-500">{d}</td></tr>
              ))}
            </tbody>
          </table>
          <a href={`/datasets/${p.dataset.file}`} download className="btn-secondary mt-3 !py-1.5"><Download size={14} /> Download CSV</a>
        </Block>
        <Block icon={Package} title="Required libraries">
          <div className="flex flex-wrap gap-2">{p.libraries.map((l) => <code key={l} className="rounded bg-slate-100 px-2 py-1 text-sm dark:bg-slate-800">{l}</code>)}</div>
          <h3 className="mt-5 mb-2 font-semibold">Expected output</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{p.expectedOutput.map((o) => <li key={o}>{o}</li>)}</ul>
        </Block>
      </div>

      <Block icon={ListChecks} title={`Step-by-step implementation (${doneSteps}/${p.steps.length})`}>
        <ProgressBar pct={(doneSteps / p.steps.length) * 100} className="mb-4" />
        <ol className="space-y-2">
          {p.steps.map((s, i) => (
            <li key={i} className="rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 p-3">
                <button onClick={() => actions.setProjectStep(p.id, i, !rec.steps[i])} aria-label={rec.steps[i] ? 'Mark step not done' : 'Mark step done'}>
                  {rec.steps[i] ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-300 dark:text-slate-600" />}
                </button>
                <button className="flex-1 text-left font-medium" onClick={() => setOpenStep(openStep === i ? null : i)}>
                  Step {i + 1}: {s.title}
                </button>
              </div>
              {openStep === i && (
                <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
                  <Markdown>{s.detail}</Markdown>
                  {s.code && <CodeRunner code={s.code} title="Example code for this step" />}
                </div>
              )}
            </li>
          ))}
        </ol>
      </Block>

      <Block icon={Code2} title="Your workspace">
        <p className="mb-3 text-sm text-slate-500">A persistent Python session for this project: variables survive between runs, so you can build your analysis piece by piece.</p>
        <CodeRunner code={p.starter} namespace={`project-${p.id}`} minHeight="220px" />
        <button
          className="btn-ghost mt-2 text-sm"
          onClick={() => navigate('/tutor', { state: { mode: 'hint', context: `Project: ${p.title}\n${p.businessProblem}`, prompt: `I'm working on the project "${p.title}". ` } })}
        >
          <Bot size={15} /> Ask the tutor for help with this project
        </button>
      </Block>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block icon={Award} title="Evaluation criteria">
          <ul className="space-y-2 text-sm">{p.evaluation.map((e) => <li key={e} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-indigo-400" /> {e}</li>)}</ul>
        </Block>
        <Block icon={FileText} title="Final project report">
          <p className="mb-2 text-sm text-slate-500">Write your report here (Markdown). It is saved in this browser. Start from the template, then download it for your GitHub README.</p>
          <textarea
            className="input h-72 font-mono text-xs leading-relaxed"
            value={rec.notes || p.reportTemplate}
            onChange={(e) => actions.setProjectNotes(p.id, e.target.value)}
            aria-label="Project report"
          />
          <div className="mt-2 flex gap-2">
            <button className="btn-secondary !py-1.5" onClick={downloadReport}><Download size={14} /> Download .md</button>
            <button className="btn-ghost !py-1.5" onClick={() => { navigator.clipboard?.writeText(rec.notes || p.reportTemplate).then(() => notify({ kind: 'info', text: 'Report copied' })); }}><Copy size={14} /> Copy</button>
          </div>
        </Block>
      </div>
    </div>
  );
}
