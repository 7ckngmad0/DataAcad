import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { WidgetTitle, makeRng } from './plot';

const SALES = [
  { q: 'Q1', a: 96, b: 94 },
  { q: 'Q2', a: 97, b: 95 },
  { q: 'Q3', a: 98, b: 95 },
  { q: 'Q4', a: 100, b: 96 },
];

export function MisleadingCharts() {
  const [truncate, setTruncate] = useState(true);
  return (
    <div>
      <WidgetTitle title="Spot the misleading chart">Same data, two y-axes. Toggle the axis and notice how a truncated axis exaggerates small differences.</WidgetTitle>
      <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={truncate} onChange={(e) => setTruncate(e.target.checked)} /> Truncate the y-axis (start at 93)</label>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={SALES}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e180" />
            <XAxis dataKey="q" />
            <YAxis domain={truncate ? [93, 100] : [0, 100]} allowDataOverflow />
            <Tooltip />
            <Bar dataKey="a" name="Product A sales (k)" fill="#6366f1" />
            <Bar dataKey="b" name="Product B sales (k)" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {truncate
          ? 'With the axis starting at 93, Product A looks like it sells 2–3× more than B. In reality the gap is only 2–4%. Bar charts must start at zero because bar length encodes the value.'
          : 'With a zero baseline the bars are honest: A and B are nearly identical. (Line charts may use a non-zero baseline, as long as it is clearly labelled.)'}
      </p>
    </div>
  );
}

const rng = makeRng(4);
const TREND = Array.from({ length: 12 }, (_, i) => ({ m: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i], v: Math.round(100 + i * 6 + rng.normal() * 8) }));
const SCAT = Array.from({ length: 60 }, () => {
  const x = 1 + rng.rand() * 9;
  return { x: Math.round(x * 10) / 10, y: Math.round((40 + 5 * x + rng.normal() * 6) * 10) / 10 };
});
const HIST = (() => {
  const c = new Array(12).fill(0);
  for (let i = 0; i < 400; i++) {
    const v = 50 + rng.normal() * 12;
    const b = Math.floor((v - 14) / 6);
    if (b >= 0 && b < 12) c[b]++;
  }
  return c.map((n, i) => ({ bin: `${14 + i * 6}`, n }));
})();
const SHARE = [{ k: 'Mobile', v: 58 }, { k: 'Desktop', v: 34 }, { k: 'Tablet', v: 8 }];
const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const GALLERY = {
  line: { q: 'How does a value change over time?', why: 'Lines connect ordered points, making trends and seasonality visible.', node: (
    <LineChart data={TREND}><CartesianGrid strokeDasharray="3 3" stroke="#cbd5e180" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Line dataKey="v" name="Monthly revenue" stroke="#6366f1" strokeWidth={2} /></LineChart>
  ) },
  bar: { q: 'How do categories compare?', why: 'Bar length is easy to compare; always start at zero; sort bars for readability.', node: (
    <BarChart data={[...TREND].sort((a, b) => b.v - a.v).slice(0, 6)}><CartesianGrid strokeDasharray="3 3" stroke="#cbd5e180" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Bar dataKey="v" name="Revenue" fill="#6366f1" /></BarChart>
  ) },
  histogram: { q: 'What is the distribution (shape, centre, spread) of one numeric variable?', why: 'Bins counts of values; reveals skew, multiple peaks and outliers.', node: (
    <BarChart data={HIST} barCategoryGap={1}><XAxis dataKey="bin" /><YAxis /><Tooltip /><Bar dataKey="n" name="Count" fill="#6366f1" /></BarChart>
  ) },
  scatter: { q: 'Is there a relationship between two numeric variables?', why: 'Each point is one observation; patterns suggest correlation (not causation).', node: (
    <ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="#cbd5e180" /><XAxis dataKey="x" name="Study hours" type="number" /><YAxis dataKey="y" name="Score" type="number" /><ZAxis range={[40, 40]} /><Tooltip /><Scatter data={SCAT} fill="#6366f1" /></ScatterChart>
  ) },
  pie: { q: 'What share of a whole does each part make up? (few categories only)', why: 'Use only for 2–5 parts that sum to 100%. Humans compare angles poorly — a bar chart is often clearer.', node: (
    <PieChart><Tooltip /><Pie data={SHARE} dataKey="v" nameKey="k" outerRadius={90} label>{SHARE.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie></PieChart>
  ) },
};

export function ChartGallery() {
  const [k, setK] = useState<keyof typeof GALLERY>('line');
  const g = GALLERY[k];
  return (
    <div>
      <WidgetTitle title="Which chart answers which question?">Pick a chart type to see an example and the question it answers best.</WidgetTitle>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.keys(GALLERY).map((key) => <button key={key} className={key === k ? 'btn-primary !py-1 capitalize' : 'btn-secondary !py-1 capitalize'} onClick={() => setK(key as keyof typeof GALLERY)}>{key}</button>)}
      </div>
      <div className="h-64"><ResponsiveContainer>{g.node}</ResponsiveContainer></div>
      <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60"><b>Question:</b> {g.q}<br /><b>Why it works:</b> {g.why}</div>
    </div>
  );
}
