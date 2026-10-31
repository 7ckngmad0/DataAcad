import { useMemo, useState } from 'react';
import { Plot, Slider, WidgetTitle, makeRng, mean, path } from './plot';

export function Regression() {
  const [pts, setPts] = useState<[number, number][]>([[1, 2.1], [2, 2.9], [3, 4.2], [4, 4.8], [5, 6.1], [6, 6.8], [7, 8.3]]);
  const [manual, setManual] = useState(false);
  const [m, setM] = useState(0.5);
  const [b, setB] = useState(1);
  const fit = useMemo(() => {
    if (pts.length < 2) return null;
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const mx = mean(xs);
    const my = mean(ys);
    const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    if (sxx === 0) return null;
    const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / sxx;
    const icpt = my - slope * mx;
    const ssTot = ys.reduce((s, y) => s + (y - my) ** 2, 0);
    const ssRes = ys.reduce((s, y, i) => s + (y - (slope * xs[i] + icpt)) ** 2, 0);
    return { slope, icpt, r2: ssTot ? 1 - ssRes / ssTot : 1 };
  }, [pts]);
  const line = manual ? { slope: m, icpt: b } : fit;
  const mse = line ? pts.reduce((s, [x, y]) => s + (y - (line.slope * x + line.icpt)) ** 2, 0) / pts.length : 0;
  return (
    <div>
      <WidgetTitle title="Linear regression playground">Click the chart to add points. The line minimises the mean squared error (MSE). Switch to manual mode and try to beat it — you can’t!</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <Plot xDomain={[0, 10]} yDomain={[0, 12]} onClick={(x, y) => setPts((p) => [...p, [Math.round(x * 10) / 10, Math.round(y * 10) / 10]])} xLabel="x (feature)" yLabel="y (target)">
          {(s) => (
            <>
              {line && pts.map(([x, y], i) => <line key={`r${i}`} x1={s.x(x)} x2={s.x(x)} y1={s.y(y)} y2={s.y(line.slope * x + line.icpt)} className="stroke-rose-400" strokeDasharray="3 2" />)}
              {line && <line x1={s.x(0)} y1={s.y(line.icpt)} x2={s.x(10)} y2={s.y(line.slope * 10 + line.icpt)} className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2.5} />}
              {pts.map(([x, y], i) => <circle key={i} cx={s.x(x)} cy={s.y(y)} r={5} className="fill-orange-500" />)}
            </>
          )}
        </Plot>
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={manual} onChange={(e) => { setManual(e.target.checked); if (fit) { setM(Number(fit.slope.toFixed(2))); setB(Number(fit.icpt.toFixed(2))); } }} /> Manual mode</label>
          {manual && (
            <>
              <Slider label="slope m" value={m} min={-2} max={3} step={0.01} onChange={setM} format={(v) => v.toFixed(2)} />
              <Slider label="intercept b" value={b} min={-5} max={8} step={0.01} onChange={setB} format={(v) => v.toFixed(2)} />
            </>
          )}
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
            {line ? <>ŷ = {line.slope.toFixed(3)}·x + {line.icpt.toFixed(3)}<br /></> : 'Add at least 2 points with different x.'}
            MSE = {mse.toFixed(4)}<br />
            {fit && <>best possible MSE = {(pts.reduce((s, [x, y]) => s + (y - (fit.slope * x + fit.icpt)) ** 2, 0) / pts.length).toFixed(4)}<br />R² (best fit) = {fit.r2.toFixed(3)}</>}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1" onClick={() => setPts((p) => p.slice(0, -1))}>Undo</button>
            <button className="btn-ghost !py-1" onClick={() => setPts([])}>Clear</button>
          </div>
          <p className="text-xs text-slate-500">Red dashed lines are residuals (errors). Add one far-away point to see how outliers pull the line.</p>
        </div>
      </div>
    </div>
  );
}

const PALETTE = ['fill-indigo-500', 'fill-orange-500', 'fill-emerald-500', 'fill-rose-500', 'fill-sky-500'];
const STROKE = ['stroke-indigo-700', 'stroke-orange-700', 'stroke-emerald-700', 'stroke-rose-700', 'stroke-sky-700'];

export function KMeans() {
  const [k, setK] = useState(3);
  const [seed, setSeed] = useState(1);
  const data = useMemo(() => {
    const r = makeRng(21);
    const centers = [[2, 2], [7, 3], [4.5, 7.5], [8, 8]];
    return centers.flatMap(([cx, cy]) => Array.from({ length: 30 }, () => [cx + r.normal() * 0.9, cy + r.normal() * 0.9] as [number, number]));
  }, []);
  const init = () => {
    const r = makeRng(seed * 31);
    return Array.from({ length: k }, () => [1 + r.rand() * 8, 1 + r.rand() * 8] as [number, number]);
  };
  const [cents, setCents] = useState<[number, number][]>(init);
  const [phase, setPhase] = useState<'assign' | 'update'>('assign');
  const [iter, setIter] = useState(0);
  const assign = (cs: [number, number][]) => data.map(([x, y]) => cs.reduce((best, c, i) => ((x - c[0]) ** 2 + (y - c[1]) ** 2 < (x - cs[best][0]) ** 2 + (y - cs[best][1]) ** 2 ? i : best), 0));
  const labels = assign(cents);
  const inertia = data.reduce((s, [x, y], i) => s + (x - cents[labels[i]][0]) ** 2 + (y - cents[labels[i]][1]) ** 2, 0);
  const step = () => {
    if (phase === 'assign') setPhase('update');
    else {
      setCents(cents.map((c, ci) => {
        const mine = data.filter((_, i) => labels[i] === ci);
        return mine.length ? [mean(mine.map((p) => p[0])), mean(mine.map((p) => p[1]))] : c;
      }));
      setIter((i) => i + 1);
      setPhase('assign');
    }
  };
  const restart = (newK = k, newSeed = seed + 1) => {
    setSeed(newSeed);
    const r = makeRng(newSeed * 31);
    setCents(Array.from({ length: newK }, () => [1 + r.rand() * 8, 1 + r.rand() * 8] as [number, number]));
    setIter(0);
    setPhase('assign');
  };
  return (
    <div>
      <WidgetTitle title="K-means, step by step">K-means alternates two steps: (1) assign each point to the nearest centroid, (2) move each centroid to the mean of its points. Repeat until nothing changes.</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_230px]">
        <Plot xDomain={[0, 10]} yDomain={[0, 10]} width={420} height={360}>
          {(s) => (
            <>
              {data.map(([x, y], i) => <circle key={i} cx={s.x(x)} cy={s.y(y)} r={4} className={`${PALETTE[labels[i] % 5]} opacity-75`} />)}
              {cents.map(([x, y], i) => (
                <g key={`c${i}`}>
                  <circle cx={s.x(x)} cy={s.y(y)} r={10} className={`${PALETTE[i % 5]} ${STROKE[i % 5]}`} strokeWidth={3} />
                  <text x={s.x(x)} y={s.y(y) + 4} textAnchor="middle" className="fill-white text-[11px] font-bold">✕</text>
                </g>
              ))}
            </>
          )}
        </Plot>
        <div className="space-y-3 text-sm">
          <Slider label="k (clusters)" value={k} min={1} max={5} onChange={(v) => { setK(v); restart(v); }} />
          <button className="btn-primary w-full" onClick={step}>{phase === 'assign' ? 'Step: points assigned → move centroids' : 'Step: move centroids'}</button>
          <button className="btn-secondary w-full" onClick={() => restart()}>New random start</button>
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">iteration = {iter}<br />inertia (within-cluster SS) = {inertia.toFixed(1)}</div>
          <p className="text-xs text-slate-500">The data has 4 true groups. Try k = 2…5 and compare inertia. Different random starts can end in different solutions — that’s why scikit-learn runs several (n_init).</p>
        </div>
      </div>
    </div>
  );
}

export function ConfusionMatrix() {
  const [threshold, setThreshold] = useState(0.5);
  const scores = useMemo(() => {
    const r = makeRng(8);
    const pos = Array.from({ length: 100 }, () => ({ y: 1, p: Math.min(0.99, Math.max(0.01, 0.68 + r.normal() * 0.17)) }));
    const neg = Array.from({ length: 300 }, () => ({ y: 0, p: Math.min(0.99, Math.max(0.01, 0.32 + r.normal() * 0.17)) }));
    return [...pos, ...neg];
  }, []);
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const s of scores) {
    const pred = s.p >= threshold ? 1 : 0;
    if (pred && s.y) tp++;
    else if (pred && !s.y) fp++;
    else if (!pred && s.y) fn++;
    else tn++;
  }
  const acc = (tp + tn) / scores.length;
  const prec = tp + fp ? tp / (tp + fp) : 0;
  const rec = tp + fn ? tp / (tp + fn) : 0;
  const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
  const C = ({ label, v, cls }: { label: string; v: number; cls: string }) => (
    <div className={`rounded-lg p-3 text-center ${cls}`}><div className="text-2xl font-bold">{v}</div><div className="text-xs">{label}</div></div>
  );
  return (
    <div>
      <WidgetTitle title="Confusion matrix & the decision threshold">A fraud model outputs a probability for 400 transactions (100 are fraud). Move the threshold to decide what counts as “fraud” and watch the trade-off between precision and recall.</WidgetTitle>
      <Slider label="threshold" value={threshold} min={0.05} max={0.95} step={0.01} onChange={setThreshold} format={(v) => v.toFixed(2)} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 grid grid-cols-[80px_1fr_1fr] gap-2 text-center text-xs text-slate-500"><span /><span>Predicted fraud</span><span>Predicted OK</span></div>
          <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
            <span className="text-right text-xs text-slate-500">Actual fraud</span>
            <C label="True positives" v={tp} cls="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" />
            <C label="False negatives" v={fn} cls="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200" />
            <span className="text-right text-xs text-slate-500">Actual OK</span>
            <C label="False positives" v={fp} cls="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" />
            <C label="True negatives" v={tn} cls="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {[['Accuracy', acc, '(TP+TN)/all'], ['Precision', prec, 'TP/(TP+FP)'], ['Recall', rec, 'TP/(TP+FN)'], ['F1-score', f1, '2PR/(P+R)']].map(([k, v, f]) => (
            <div key={k as string} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">{k} <span className="text-[10px]">{f}</span></div><div className="text-xl font-bold">{((v as number) * 100).toFixed(1)}%</div></div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Lower threshold → catch more fraud (recall ↑) but more false alarms (precision ↓). Note: predicting “OK” for everything gives 75% accuracy with 0% recall — why accuracy alone misleads on imbalanced data.</p>
    </div>
  );
}

function polyfit(xs: number[], ys: number[], deg: number) {
  // Least squares via normal equations with tiny ridge for stability.
  const n = deg + 1;
  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  const bv = new Array(n).fill(0);
  xs.forEach((x, i) => {
    for (let r = 0; r < n; r++) {
      bv[r] += ys[i] * x ** r;
      for (let c = 0; c < n; c++) A[r][c] += x ** (r + c);
    }
  });
  for (let r = 0; r < n; r++) A[r][r] += 1e-9;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [bv[c], bv[p]] = [bv[p], bv[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      bv[r] -= f * bv[c];
    }
  }
  const w = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) w[r] = (bv[r] - A[r].slice(r + 1).reduce((s, a, k) => s + a * w[r + 1 + k], 0)) / A[r][r];
  return (x: number) => w.reduce((s, c, k) => s + c * x ** k, 0);
}

export function Overfitting() {
  const [deg, setDeg] = useState(1);
  const { train, test } = useMemo(() => {
    const r = makeRng(12);
    const f = (x: number) => Math.sin(x * 1.2) * 2 + 0.3 * x;
    const mk = (n: number) => Array.from({ length: n }, () => { const x = r.rand() * 6; return [x, f(x) + r.normal() * 0.45] as [number, number]; });
    return { train: mk(14), test: mk(40) };
  }, []);
  // Fit on x scaled to [-1, 1] to keep the normal equations well conditioned.
  const sc = (x: number) => x / 3 - 1;
  const model = useMemo(() => polyfit(train.map((p) => sc(p[0])), train.map((p) => p[1]), deg), [deg, train]);
  const err = (set: [number, number][]) => set.reduce((s, [x, y]) => s + (y - model(sc(x))) ** 2, 0) / set.length;
  const curve: [number, number][] = [];
  for (let x = 0; x <= 6.001; x += 0.02) curve.push([x, model(sc(x))]);
  const trainE = err(train);
  const testE = err(test);
  return (
    <div>
      <WidgetTitle title="Underfitting vs overfitting">Fit a polynomial of increasing degree to 14 training points (orange). Test points (grey) were not used for fitting.</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_230px]">
        <Plot xDomain={[0, 6]} yDomain={[-3, 5]}>
          {(s) => (
            <>
              {test.map(([x, y], i) => <circle key={`t${i}`} cx={s.x(x)} cy={s.y(y)} r={3.5} className="fill-slate-400/70" />)}
              <path d={path(curve.filter((p) => Math.abs(p[1]) < 50).map((p) => [s.x(p[0]), s.y(p[1])]))} className="fill-none stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2.5} />
              {train.map(([x, y], i) => <circle key={i} cx={s.x(x)} cy={s.y(y)} r={5} className="fill-orange-500" />)}
            </>
          )}
        </Plot>
        <div className="space-y-3">
          <Slider label="polynomial degree" value={deg} min={0} max={12} onChange={setDeg} />
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">train MSE = {trainE.toFixed(3)}<br />test MSE = <b>{testE > 999 ? '> 999' : testE.toFixed(3)}</b></div>
          <div className={`rounded-lg p-2 text-sm font-medium ${deg <= 1 ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : deg <= 5 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'}`}>
            {deg <= 1 ? 'Underfitting: too simple, high error on both sets (high bias).' : deg <= 5 ? 'Good fit: captures the pattern, generalises to test data.' : 'Overfitting: memorises training noise; test error rises (high variance).'}
          </div>
          <p className="text-xs text-slate-500">Training error always goes down as complexity rises. Only the test error tells you how well the model generalises.</p>
        </div>
      </div>
    </div>
  );
}

export function Neuron() {
  const [w1, setW1] = useState(1.5);
  const [w2, setW2] = useState(-1);
  const [b, setB] = useState(0);
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0.5);
  const z = w1 * x1 + w2 * x2 + b;
  const relu = Math.max(0, z);
  const sig = 1 / (1 + Math.exp(-z));
  return (
    <div>
      <WidgetTitle title="A single artificial neuron">A neuron computes a weighted sum of its inputs plus a bias, then applies an activation function. Networks stack thousands of these.</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Slider label="input x₁" value={x1} min={-2} max={2} step={0.1} onChange={setX1} format={(v) => v.toFixed(1)} />
          <Slider label="input x₂" value={x2} min={-2} max={2} step={0.1} onChange={setX2} format={(v) => v.toFixed(1)} />
          <Slider label="weight w₁" value={w1} min={-3} max={3} step={0.1} onChange={setW1} format={(v) => v.toFixed(1)} />
          <Slider label="weight w₂" value={w2} min={-3} max={3} step={0.1} onChange={setW2} format={(v) => v.toFixed(1)} />
          <Slider label="bias b" value={b} min={-3} max={3} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
        </div>
        <div className="space-y-3">
          <svg viewBox="0 0 300 160" className="w-full">
            <circle cx="40" cy="45" r="20" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950" strokeWidth="2" />
            <text x="40" y="49" textAnchor="middle" className="fill-slate-700 text-[11px] dark:fill-slate-200">x₁={x1.toFixed(1)}</text>
            <circle cx="40" cy="115" r="20" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950" strokeWidth="2" />
            <text x="40" y="119" textAnchor="middle" className="fill-slate-700 text-[11px] dark:fill-slate-200">x₂={x2.toFixed(1)}</text>
            <line x1="60" y1="50" x2="140" y2="78" strokeWidth={1 + Math.abs(w1) * 1.5} className={w1 >= 0 ? 'stroke-indigo-500' : 'stroke-rose-500'} />
            <line x1="60" y1="110" x2="140" y2="82" strokeWidth={1 + Math.abs(w2) * 1.5} className={w2 >= 0 ? 'stroke-indigo-500' : 'stroke-rose-500'} />
            <circle cx="165" cy="80" r="28" className="fill-indigo-100 stroke-indigo-600 dark:fill-indigo-950" strokeWidth="2" />
            <text x="165" y="84" textAnchor="middle" className="fill-slate-700 text-[11px] dark:fill-slate-200">Σ + b</text>
            <line x1="193" y1="80" x2="250" y2="80" className="stroke-slate-400" strokeWidth="2" />
            <text x="255" y="84" className="fill-slate-700 text-[11px] dark:fill-slate-200">out</text>
          </svg>
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
            z = w₁x₁ + w₂x₂ + b = {z.toFixed(2)}<br />ReLU(z) = max(0, z) = {relu.toFixed(3)}<br />sigmoid(z) = 1/(1+e⁻ᶻ) = {sig.toFixed(3)}
          </div>
          <p className="text-xs text-slate-500">Training a network = automatically adjusting all the weights and biases (with gradient descent) so the outputs match the labels.</p>
        </div>
      </div>
    </div>
  );
}
