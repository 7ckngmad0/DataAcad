import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { WidgetTitle } from './plot';

const STAGES = [
  ['Ask', 'Define the business question and how success is measured.', 'A streaming service asks: “Why are subscribers cancelling, and who is likely to cancel next month?” Success = reduce churn by 2 points.'],
  ['Collect', 'Gather the data you need from databases, APIs, files, surveys or sensors.', 'Pull 24 months of subscription records, viewing history, support tickets and payment failures from the company database.'],
  ['Clean', 'Fix missing values, duplicates, wrong types and errors. Usually 50–80% of the work.', 'Remove duplicate accounts, standardise country names, fill missing ages, convert dates to real date types.'],
  ['Explore', 'Summarise and visualise to find patterns, relationships and surprises (EDA).', 'Charts show churn is 3× higher for monthly plans and for users who watched < 2 hours in their last month.'],
  ['Model', 'Build statistical or machine-learning models to explain or predict.', 'Train a logistic regression and a random forest to predict churn probability for every subscriber.'],
  ['Evaluate', 'Check whether results are accurate, fair and actually answer the question.', 'The model catches 72% of churners on unseen data; precision is good enough to target a retention offer.'],
  ['Communicate & deploy', 'Share insights with stakeholders and put the solution into use; monitor it.', 'Present findings to management; the model runs weekly and sends at-risk users a discount. Churn falls 2.4 points.'],
] as const;

export function Lifecycle() {
  const [i, setI] = useState(0);
  return (
    <div>
      <WidgetTitle title="The Data Science lifecycle">Click each stage to see what happens there, with a running real-world example.</WidgetTitle>
      <div className="flex flex-wrap items-center gap-1.5">
        {STAGES.map(([name], k) => (
          <div key={name} className="flex items-center gap-1.5">
            <button onClick={() => setI(k)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${k === i ? 'bg-indigo-600 text-white' : k < i ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {k + 1}. {name}
            </button>
            {k < STAGES.length - 1 && <span className="text-slate-300">→</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <div className="text-xs font-semibold uppercase text-slate-400">What happens</div>
          <p className="mt-1 text-sm">{STAGES[i][1]}</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-4 dark:bg-sky-950/30">
          <div className="text-xs font-semibold uppercase text-sky-600">Example: subscriber churn</div>
          <p className="mt-1 text-sm">{STAGES[i][2]}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn-secondary !py-1" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
        <button className="btn-primary !py-1" disabled={i === STAGES.length - 1} onClick={() => setI(i + 1)}>Next stage</button>
      </div>
      <p className="mt-3 text-xs text-slate-500">In practice the cycle loops: evaluation often sends you back to collect more data or ask a sharper question.</p>
    </div>
  );
}

const ITEMS: [string, string][] = [
  ['Age of a customer (years)', 'Numerical – discrete'],
  ['Temperature in °C', 'Numerical – continuous'],
  ['Blood type (A, B, AB, O)', 'Categorical – nominal'],
  ['T-shirt size (S, M, L, XL)', 'Categorical – ordinal'],
  ['Number of children', 'Numerical – discrete'],
  ['Customer satisfaction (1–5 stars)', 'Categorical – ordinal'],
  ['Country of residence', 'Categorical – nominal'],
  ['House price in dollars', 'Numerical – continuous'],
  ['Payment method (cash / card)', 'Categorical – nominal'],
  ['Time to deliver an order (hours)', 'Numerical – continuous'],
];
const CATS = ['Numerical – discrete', 'Numerical – continuous', 'Categorical – nominal', 'Categorical – ordinal'];

export function DataTypeSorter() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = ITEMS.filter((it, i) => answers[i] === it[1]).length;
  return (
    <div>
      <WidgetTitle title="Classify the data">Choose the type of each variable, then check your answers.</WidgetTitle>
      <div className="space-y-2">
        {ITEMS.map(([label, correct], i) => (
          <div key={label} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-2 sm:flex-row sm:items-center dark:border-slate-800">
            <span className="flex-1 text-sm">{label}</span>
            <select className="input sm:!w-60" aria-label="Data type" value={answers[i] ?? ''} disabled={checked} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}>
              <option value="" disabled>Choose…</option>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            {checked && (answers[i] === correct ? <CheckCircle2 className="text-emerald-500" size={18} /> : <span className="flex items-center gap-1 text-xs text-rose-600"><XCircle size={16} /> {correct}</span>)}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {!checked ? (
          <button className="btn-primary" disabled={Object.keys(answers).length < ITEMS.length} onClick={() => setChecked(true)}>Check answers</button>
        ) : (
          <>
            <span className="font-semibold">{score}/{ITEMS.length} correct</span>
            <button className="btn-secondary" onClick={() => { setAnswers({}); setChecked(false); }}><RotateCcw size={14} /> Try again</button>
          </>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">Tip: ask “can I meaningfully average it?” (numerical) and “do the categories have a natural order?” (ordinal vs nominal). Star ratings are often treated as numbers in practice, but strictly they are ordinal.</p>
    </div>
  );
}
