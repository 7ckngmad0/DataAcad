import { useMemo, useState } from 'react';
import { Plot, Slider, WidgetTitle, makeRng, mean, path, std } from './plot';

function quantile(sorted: number[], q: number) {
  // Linear interpolation (same as numpy's default and pandas .quantile()).
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function DescriptiveStats() {
  const [text, setText] = useState('12, 15, 15, 18, 20, 22, 25, 30, 95');
  const nums = text.split(/[\s,;]+/).map(Number).filter((n) => Number.isFinite(n) && text.trim() !== '');
  const sorted = [...nums].sort((a, b) => a - b);
  const n = nums.length;
  const stats = useMemo(() => {
    if (!n) return null;
    const counts = new Map<number, number>();
    nums.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    const maxC = Math.max(...counts.values());
    const modes = maxC > 1 ? [...counts].filter(([, c]) => c === maxC).map(([v]) => v) : [];
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    return {
      mean: mean(nums), median: quantile(sorted, 0.5), modes, range: sorted[n - 1] - sorted[0],
      varS: n > 1 ? std(nums) ** 2 : 0, sdS: n > 1 ? std(nums) : 0, sdP: std(nums, 0), q1, q3, iqr: q3 - q1,
    };
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  const lo = n ? Math.min(...nums) : 0;
  const hi = n ? Math.max(...nums) : 1;
  const pad = (hi - lo) * 0.08 || 1;
  return (
    <div>
      <WidgetTitle title="Descriptive statistics calculator">Edit the numbers (comma-separated). Try removing the outlier 95 and watch how the mean and standard deviation react compared with the median and IQR.</WidgetTitle>
      <input className="input font-mono" aria-label="Numbers, comma-separated" value={text} onChange={(e) => setText(e.target.value)} />
      {stats && (
        <>
          <Plot xDomain={[lo - pad, hi + pad]} yDomain={[0, 4]} height={150} xLabel="value">
            {(s) => (
              <>
                {sorted.map((v, i) => {
                  const stack = sorted.slice(0, i).filter((x) => x === v).length;
                  return <circle key={i} cx={s.x(v)} cy={s.y(0.5 + stack * 0.6)} r={6} className="fill-indigo-500/80" />;
                })}
                <line x1={s.x(stats.mean)} x2={s.x(stats.mean)} y1={s.y(0)} y2={s.y(4)} className="stroke-orange-500" strokeWidth={2} />
                <text x={s.x(stats.mean) + 4} y={s.y(3.6)} className="fill-orange-500 text-[11px]">mean</text>
                <line x1={s.x(stats.median)} x2={s.x(stats.median)} y1={s.y(0)} y2={s.y(4)} className="stroke-emerald-500" strokeWidth={2} strokeDasharray="5 3" />
                <text x={s.x(stats.median) + 4} y={s.y(3.1)} className="fill-emerald-600 text-[11px]">median</text>
              </>
            )}
          </Plot>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
            {[
              ['n', n], ['mean', stats.mean.toFixed(2)], ['median', stats.median.toFixed(2)], ['mode', stats.modes.length ? stats.modes.join(', ') : 'none'],
              ['range', stats.range.toFixed(2)], ['variance (sample)', stats.varS.toFixed(2)], ['std dev (sample)', stats.sdS.toFixed(2)], ['std dev (population)', stats.sdP.toFixed(2)],
              ['Q1 (25%)', stats.q1.toFixed(2)], ['Q3 (75%)', stats.q3.toFixed(2)], ['IQR', stats.iqr.toFixed(2)], ['outlier fences', `${(stats.q1 - 1.5 * stats.iqr).toFixed(1)} / ${(stats.q3 + 1.5 * stats.iqr).toFixed(1)}`],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"><div className="text-[10px] uppercase text-slate-400">{k}</div><div className="text-sm">{v}</div></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProbabilitySim() {
  const [kind, setKind] = useState<'coin' | 'die'>('coin');
  const [flips, setFlips] = useState<number[]>([]);
  const [seed, setSeed] = useState(1);
  const target = kind === 'coin' ? 0.5 : 1 / 6;
  const add = (k: number) => {
    const r = makeRng(seed * 7919 + flips.length);
    const out: number[] = [];
    for (let i = 0; i < k; i++) out.push(kind === 'coin' ? (r.rand() < 0.5 ? 1 : 0) : (Math.floor(r.rand() * 6) + 1 === 6 ? 1 : 0));
    setSeed((s) => s + 1);
    setFlips((f) => [...f, ...out].slice(0, 20000));
  };
  const running = useMemo(() => {
    let c = 0;
    const pts: [number, number][] = [];
    const every = Math.max(1, Math.floor(flips.length / 400));
    flips.forEach((v, i) => {
      c += v;
      if (i % every === 0 || i === flips.length - 1) pts.push([i + 1, c / (i + 1)]);
    });
    return pts;
  }, [flips]);
  const hits = flips.reduce((a, b) => a + b, 0);
  return (
    <div>
      <WidgetTitle title="The law of large numbers">Simulate random events. The observed proportion wobbles wildly at first, then settles near the true probability.</WidgetTitle>
      <div className="mb-3 flex flex-wrap gap-2">
        <select className="input !w-auto" aria-label="Experiment" value={kind} onChange={(e) => { setKind(e.target.value as 'coin' | 'die'); setFlips([]); }}>
          <option value="coin">Coin: P(heads)</option>
          <option value="die">Die: P(rolling a 6)</option>
        </select>
        {[1, 10, 100, 1000].map((k) => <button key={k} className="btn-secondary" onClick={() => add(k)}>+{k}</button>)}
        <button className="btn-ghost" onClick={() => setFlips([])}>Reset</button>
      </div>
      <Plot xDomain={[1, Math.max(10, flips.length)]} yDomain={[0, 1]} height={240} xLabel="number of trials" yLabel="observed proportion">
        {(s) => (
          <>
            <line x1={s.x(1)} x2={s.x(Math.max(10, flips.length))} y1={s.y(target)} y2={s.y(target)} className="stroke-emerald-500" strokeDasharray="6 4" strokeWidth={2} />
            {running.length > 0 && <path d={path(running.map((p) => [s.x(p[0]), s.y(p[1])]))} className="fill-none stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2} />}
          </>
        )}
      </Plot>
      <p className="mt-2 font-mono text-sm">trials = {flips.length} · successes = {hits} · proportion = {flips.length ? (hits / flips.length).toFixed(4) : '—'} · true P = {target.toFixed(4)}</p>
    </div>
  );
}

export function Bayes() {
  const [prior, setPrior] = useState(1);
  const [sens, setSens] = useState(95);
  const [spec, setSpec] = useState(90);
  const p = prior / 100;
  const tp = p * (sens / 100);
  const fp = (1 - p) * (1 - spec / 100);
  const post = tp / (tp + fp);
  const N = 10000;
  return (
    <div>
      <WidgetTitle title="Bayes’ theorem: medical test">A disease affects some % of people. A test detects it with some sensitivity and correctly clears healthy people with some specificity. If you test positive, how likely is it that you have the disease?</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Slider label="Prevalence P(disease)" value={prior} min={0.1} max={50} step={0.1} onChange={setPrior} format={(v) => `${v}%`} />
          <Slider label="Sensitivity P(+ | disease)" value={sens} min={50} max={100} step={0.5} onChange={setSens} format={(v) => `${v}%`} />
          <Slider label="Specificity P(− | healthy)" value={spec} min={50} max={100} step={0.5} onChange={setSpec} format={(v) => `${v}%`} />
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <div>Out of {N.toLocaleString()} people tested:</div>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            <li>Sick & test positive (true +): <b>{Math.round(N * tp)}</b></li>
            <li>Healthy & test positive (false +): <b>{Math.round(N * fp)}</b></li>
          </ul>
          <div className="mt-3">P(disease | +) = {Math.round(N * tp)} / ({Math.round(N * tp)} + {Math.round(N * fp)}) =</div>
          <div className="mt-1 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{(post * 100).toFixed(1)}%</div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-rose-200 dark:bg-rose-900">
            <div className="h-full bg-indigo-600" style={{ width: `${post * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">With a rare disease, most positives are false alarms — even with a good test. That is why the prior matters.</p>
        </div>
      </div>
    </div>
  );
}

function binom(n: number, k: number, p: number) {
  let lc = 0;
  for (let i = 1; i <= k; i++) lc += Math.log(n - k + i) - Math.log(i);
  return Math.exp(lc + k * Math.log(p || 1e-12) + (n - k) * Math.log(1 - p || 1e-12));
}

export function Distributions() {
  const [kind, setKind] = useState<'normal' | 'binomial'>('normal');
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.3);
  const pdf = (x: number) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
  const curve: [number, number][] = [];
  for (let x = -8; x <= 8.001; x += 0.05) curve.push([x, pdf(x)]);
  const bars = Array.from({ length: n + 1 }, (_, k) => binom(n, k, p));
  const maxBar = Math.max(...bars);
  return (
    <div>
      <WidgetTitle title="Probability distribution explorer" />
      <div className="mb-3 flex gap-2">
        {(['normal', 'binomial'] as const).map((k) => <button key={k} onClick={() => setKind(k)} className={kind === k ? 'btn-primary' : 'btn-secondary'}>{k === 'normal' ? 'Normal' : 'Binomial'}</button>)}
      </div>
      {kind === 'normal' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_230px]">
          <Plot xDomain={[-8, 8]} yDomain={[0, Math.max(0.45, pdf(mu) * 1.1)]} xLabel="x" yLabel="density">
            {(s) => (
              <>
                {[3, 2, 1].map((k) => (
                  <path key={k} d={path([[s.x(mu - k * sigma), s.y(0)], ...curve.filter((c) => c[0] >= mu - k * sigma && c[0] <= mu + k * sigma).map((c) => [s.x(c[0]), s.y(c[1])] as [number, number]), [s.x(mu + k * sigma), s.y(0)]]) + 'Z'} className={k === 1 ? 'fill-indigo-500/40' : k === 2 ? 'fill-indigo-500/25' : 'fill-indigo-500/10'} />
                ))}
                <path d={path(curve.map((c) => [s.x(c[0]), s.y(c[1])]))} className="fill-none stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2.5} />
              </>
            )}
          </Plot>
          <div className="space-y-3">
            <Slider label="mean μ" value={mu} min={-4} max={4} step={0.1} onChange={setMu} format={(v) => v.toFixed(1)} />
            <Slider label="std dev σ" value={sigma} min={0.3} max={3} step={0.1} onChange={setSigma} format={(v) => v.toFixed(1)} />
            <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
              <b>68–95–99.7 rule</b><br />≈68% of values within μ ± 1σ = [{(mu - sigma).toFixed(1)}, {(mu + sigma).toFixed(1)}]<br />≈95% within μ ± 2σ<br />≈99.7% within μ ± 3σ
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_230px]">
          <Plot xDomain={[-0.5, n + 0.5]} yDomain={[0, maxBar * 1.15]} xLabel="number of successes k" yLabel="P(X = k)">
            {(s) => bars.map((b, k) => <rect key={k} x={s.x(k - 0.4)} width={s.x(k + 0.4) - s.x(k - 0.4)} y={s.y(b)} height={s.y(0) - s.y(b)} className="fill-indigo-500" />)}
          </Plot>
          <div className="space-y-3">
            <Slider label="trials n" value={n} min={1} max={60} onChange={setN} />
            <Slider label="success probability p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
            <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
              mean = n·p = {(n * p).toFixed(2)}<br />variance = n·p·(1−p) = {(n * p * (1 - p)).toFixed(2)}<br />std = {Math.sqrt(n * p * (1 - p)).toFixed(2)}
            </div>
            <p className="text-xs text-slate-500">Example: n = 20 customers each buy with p = 0.3. How many buy? With large n, the binomial looks normal.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CLT() {
  const [pop, setPop] = useState<'uniform' | 'skewed' | 'bimodal'>('skewed');
  const [n, setN] = useState(5);
  const [means, setMeans] = useState<number[]>([]);
  const [seed, setSeed] = useState(3);
  const draw = (r: ReturnType<typeof makeRng>) =>
    pop === 'uniform' ? r.rand() * 10 : pop === 'skewed' ? -Math.log(1 - r.rand()) * 2 : r.rand() < 0.5 ? 2 + r.normal() * 0.7 : 8 + r.normal() * 0.7;
  const sample = (k: number) => {
    const r = makeRng(seed);
    setSeed((s) => s + 1);
    const out: number[] = [];
    for (let i = 0; i < k; i++) {
      let s = 0;
      for (let j = 0; j < n; j++) s += draw(r);
      out.push(s / n);
    }
    setMeans((m) => [...m, ...out]);
  };
  const popSample = useMemo(() => {
    const r = makeRng(99);
    return Array.from({ length: 3000 }, () => draw(r));
  }, [pop]); // eslint-disable-line react-hooks/exhaustive-deps
  const hist = (vals: number[], lo: number, hi: number, bins: number) => {
    const c = new Array(bins).fill(0);
    vals.forEach((v) => {
      const b = Math.floor(((v - lo) / (hi - lo)) * bins);
      if (b >= 0 && b < bins) c[b]++;
    });
    return c;
  };
  const H = (vals: number[], label: string) => {
    const c = hist(vals, 0, 10, 40);
    const m = Math.max(1, ...c);
    return (
      <div>
        <div className="mb-1 text-xs font-medium text-slate-500">{label}</div>
        <Plot xDomain={[0, 10]} yDomain={[0, m * 1.1]} height={170}>
          {(s) => c.map((v, i) => <rect key={i} x={s.x(i * 0.25)} width={s.x(0.25) - s.x(0) - 1} y={s.y(v)} height={s.y(0) - s.y(v)} className="fill-indigo-500" />)}
        </Plot>
      </div>
    );
  };
  return (
    <div>
      <WidgetTitle title="Central Limit Theorem simulator">Take many samples of size n from a (non-normal) population and plot each sample’s mean. Even for skewed populations, the means pile up into a bell curve as n grows.</WidgetTitle>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <select className="input !w-auto" aria-label="Population shape" value={pop} onChange={(e) => { setPop(e.target.value as typeof pop); setMeans([]); }}>
          <option value="skewed">Skewed (exponential) population</option>
          <option value="uniform">Uniform population</option>
          <option value="bimodal">Bimodal population</option>
        </select>
        <div className="w-48"><Slider label="sample size n" value={n} min={1} max={50} onChange={(v) => { setN(v); setMeans([]); }} /></div>
        <button className="btn-secondary" onClick={() => sample(1)}>+1 sample</button>
        <button className="btn-primary" onClick={() => sample(500)}>+500 samples</button>
        <button className="btn-ghost" onClick={() => setMeans([])}>Reset</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {H(popSample, 'Population (individual values)')}
        {H(means, `Distribution of ${means.length} sample means (n = ${n})`)}
      </div>
      {means.length > 1 && (
        <p className="mt-2 font-mono text-xs">mean of sample means = {mean(means).toFixed(3)} (population mean = {mean(popSample).toFixed(3)}) · std of means = {std(means).toFixed(3)} ≈ σ/√n = {(std(popSample) / Math.sqrt(n)).toFixed(3)}</p>
      )}
    </div>
  );
}

export function ConfidenceIntervals() {
  const [n, setN] = useState(30);
  const [conf, setConf] = useState(95);
  const [seed, setSeed] = useState(1);
  const z = conf === 90 ? 1.645 : conf === 95 ? 1.96 : 2.576;
  const MU = 50;
  const SIGMA = 10;
  const intervals = useMemo(() => {
    const r = makeRng(seed);
    return Array.from({ length: 50 }, () => {
      const xs = Array.from({ length: n }, () => MU + SIGMA * r.normal());
      const m = mean(xs);
      const se = std(xs) / Math.sqrt(n);
      return [m - z * se, m + z * se] as [number, number];
    });
  }, [n, z, seed]);
  const covered = intervals.filter(([a, b]) => a <= MU && MU <= b).length;
  return (
    <div>
      <WidgetTitle title="What does “95% confidence” mean?">Each horizontal line is a confidence interval computed from a different random sample. The true mean is 50. About {conf}% of intervals should capture it.</WidgetTitle>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="w-48"><Slider label="sample size n" value={n} min={5} max={200} onChange={setN} /></div>
        <select className="input !w-auto" aria-label="Confidence level" value={conf} onChange={(e) => setConf(Number(e.target.value))}>
          <option value={90}>90% confidence</option><option value={95}>95% confidence</option><option value={99}>99% confidence</option>
        </select>
        <button className="btn-primary" onClick={() => setSeed((s) => s + 1)}>Draw 50 new samples</button>
      </div>
      <Plot xDomain={[38, 62]} yDomain={[0, 51]} height={360} xLabel="value">
        {(s) => (
          <>
            {intervals.map(([a, b], i) => {
              const hit = a <= MU && MU <= b;
              return <line key={i} x1={s.x(a)} x2={s.x(b)} y1={s.y(i + 1)} y2={s.y(i + 1)} strokeWidth={3} className={hit ? 'stroke-indigo-500' : 'stroke-rose-500'} />;
            })}
            <line x1={s.x(MU)} x2={s.x(MU)} y1={s.y(0)} y2={s.y(51)} className="stroke-emerald-500" strokeWidth={2} strokeDasharray="5 3" />
          </>
        )}
      </Plot>
      <p className="mt-2 text-sm"><b>{covered}/50</b> intervals ({covered * 2}%) contain the true mean. Red ones missed. Larger n → narrower intervals; higher confidence → wider intervals.</p>
    </div>
  );
}

export function Correlation() {
  const [r, setR] = useState(0.7);
  const [outlier, setOutlier] = useState(false);
  const pts = useMemo(() => {
    const g = makeRng(5);
    const out: [number, number][] = [];
    for (let i = 0; i < 80; i++) {
      const x = g.normal();
      const y = r * x + Math.sqrt(1 - r * r) * g.normal();
      out.push([x, y]);
    }
    if (outlier) out.push([3, -3]);
    return out;
  }, [r, outlier]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const mx = mean(xs);
  const my = mean(ys);
  const cov = pts.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0) / (pts.length - 1);
  const rr = cov / (std(xs) * std(ys));
  const slope = cov / std(xs) ** 2;
  return (
    <div>
      <WidgetTitle title="Correlation explorer">Set the underlying correlation and see what the scatter looks like. Then add a single outlier to see how fragile Pearson’s r can be.</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_230px]">
        <Plot xDomain={[-3.5, 3.5]} yDomain={[-3.5, 3.5]} width={420} height={360} axesAtZero>
          {(s) => (
            <>
              {pts.map(([x, y], i) => <circle key={i} cx={s.x(x)} cy={s.y(y)} r={4} className={outlier && i === pts.length - 1 ? 'fill-rose-500' : 'fill-indigo-500/70'} />)}
              <line x1={s.x(-3.5)} y1={s.y(my + slope * (-3.5 - mx))} x2={s.x(3.5)} y2={s.y(my + slope * (3.5 - mx))} className="stroke-orange-500" strokeWidth={2} />
            </>
          )}
        </Plot>
        <div className="space-y-3">
          <Slider label="target correlation" value={r} min={-1} max={1} step={0.05} onChange={setR} format={(v) => v.toFixed(2)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={outlier} onChange={(e) => setOutlier(e.target.checked)} /> Add an outlier at (3, −3)</label>
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
            covariance = {cov.toFixed(3)}<br />Pearson r = <b>{rr.toFixed(3)}</b>
          </div>
          <p className="text-xs text-slate-500">|r| near 1 = strong linear relationship; near 0 = no linear relationship. Correlation is not causation!</p>
        </div>
      </div>
    </div>
  );
}
