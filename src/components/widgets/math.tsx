import { useMemo, useState } from 'react';
import { Plot, Slider, WidgetTitle, path } from './plot';

const FUNCS = {
  linear: { label: 'Linear: y = a·x + b', f: (x: number, a: number, b: number) => a * x + b },
  quadratic: { label: 'Quadratic: y = a·x² + b', f: (x: number, a: number, b: number) => a * x * x + b },
  exponential: { label: 'Exponential: y = b·aˣ', f: (x: number, a: number, b: number) => b * Math.pow(a, x) },
  log: { label: 'Logarithm: y = a·ln(x) + b', f: (x: number, a: number, b: number) => (x > 0 ? a * Math.log(x) + b : NaN) },
  sigmoid: { label: 'Sigmoid: y = 1 / (1 + e^-(a·x + b))', f: (x: number, a: number, b: number) => 1 / (1 + Math.exp(-(a * x + b))) },
};

export function FunctionGrapher() {
  const [kind, setKind] = useState<keyof typeof FUNCS>('linear');
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const F = FUNCS[kind];
  const pts = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = -5; x <= 5.001; x += 0.05) out.push([x, F.f(x, a, b)]);
    return out;
  }, [F, a, b]);
  return (
    <div>
      <WidgetTitle title="Function explorer">Pick a function family and drag the sliders to see how each parameter changes the graph.</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Plot xDomain={[-5, 5]} yDomain={kind === 'sigmoid' ? [-0.2, 1.2] : [-10, 10]} axesAtZero xLabel="x" yLabel="y">
          {(s) => (
            <path
              d={path(pts.filter((p) => Number.isFinite(p[1]) && Math.abs(p[1]) < 1e4).map((p) => [s.x(p[0]), s.y(p[1])]))}
              className="fill-none stroke-indigo-600 dark:stroke-indigo-400"
              strokeWidth={2.5}
            />
          )}
        </Plot>
        <div className="space-y-3">
          <select className="input" aria-label="Function type" value={kind} onChange={(e) => { const k = e.target.value as keyof typeof FUNCS; setKind(k); setA(k === 'exponential' ? 2 : 1); setB(k === 'exponential' ? 1 : 0); }}>
            {Object.entries(FUNCS).map(([k, v]) => <option key={k} value={k}>{v.label.split(':')[0]}</option>)}
          </select>
          <div className="rounded-lg bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800">{F.label}</div>
          <Slider label="a" value={a} min={kind === 'exponential' ? 0.2 : -4} max={4} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
          <Slider label="b" value={b} min={-5} max={5} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
          <p className="text-xs text-slate-500">
            {kind === 'linear' && 'a is the slope (rise over run); b is where the line crosses the y-axis.'}
            {kind === 'quadratic' && 'a > 0 opens upward (a valley — like a loss function), a < 0 opens downward.'}
            {kind === 'exponential' && 'a > 1 grows faster and faster; 0 < a < 1 decays. Compound interest and viral growth are exponential.'}
            {kind === 'log' && 'The logarithm is the inverse of the exponential: it grows ever more slowly. Only defined for x > 0.'}
            {kind === 'sigmoid' && 'Squashes any number into (0, 1) — logistic regression uses it to turn a score into a probability.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Derivative() {
  const [x0, setX0] = useState(1);
  const [h, setH] = useState(1);
  const f = (x: number) => 0.5 * x * x * x - 2 * x;
  const df = (x: number) => 1.5 * x * x - 2;
  const pts: [number, number][] = [];
  for (let x = -3; x <= 3.001; x += 0.03) pts.push([x, f(x)]);
  const secant = (f(x0 + h) - f(x0)) / h;
  const tangent = df(x0);
  return (
    <div>
      <WidgetTitle title="From slope of a secant to the derivative">
        f(x) = 0.5x³ − 2x. The orange line joins two points h apart. As h → 0 it becomes the tangent (green), whose slope is the derivative f′(x).
      </WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Plot xDomain={[-3, 3]} yDomain={[-6, 6]} axesAtZero xLabel="x" yLabel="f(x)">
          {(s) => (
            <>
              <path d={path(pts.map((p) => [s.x(p[0]), s.y(p[1])]))} className="fill-none stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2.5} />
              <line x1={s.x(-3)} y1={s.y(f(x0) + tangent * (-3 - x0))} x2={s.x(3)} y2={s.y(f(x0) + tangent * (3 - x0))} className="stroke-emerald-500" strokeWidth={2} />
              <line x1={s.x(-3)} y1={s.y(f(x0) + secant * (-3 - x0))} x2={s.x(3)} y2={s.y(f(x0) + secant * (3 - x0))} className="stroke-orange-500" strokeWidth={2} strokeDasharray="6 4" />
              <circle cx={s.x(x0)} cy={s.y(f(x0))} r={5} className="fill-slate-900 dark:fill-white" />
              <circle cx={s.x(x0 + h)} cy={s.y(f(x0 + h))} r={4} className="fill-orange-500" />
            </>
          )}
        </Plot>
        <div className="space-y-3">
          <Slider label="x" value={x0} min={-2.5} max={2.5} step={0.05} onChange={setX0} format={(v) => v.toFixed(2)} />
          <Slider label="h (gap)" value={h} min={0.01} max={2} step={0.01} onChange={setH} format={(v) => v.toFixed(2)} />
          <div className="space-y-1 rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
            <div className="text-orange-600">secant slope = {secant.toFixed(4)}</div>
            <div className="text-emerald-600">f′(x) = 1.5x² − 2 = {tangent.toFixed(4)}</div>
            <div>difference = {Math.abs(secant - tangent).toFixed(4)}</div>
          </div>
          <p className="text-xs text-slate-500">Where f′(x) = 0 (x ≈ ±1.15) the tangent is flat: a local maximum or minimum. Optimisation algorithms search for these points.</p>
        </div>
      </div>
    </div>
  );
}

export function Vectors() {
  const [u, setU] = useState<[number, number]>([3, 1]);
  const [v, setV] = useState<[number, number]>([1, 2]);
  const sum: [number, number] = [u[0] + v[0], u[1] + v[1]];
  const dot = u[0] * v[0] + u[1] * v[1];
  const nu = Math.hypot(...u);
  const nv = Math.hypot(...v);
  const angle = (Math.acos(Math.max(-1, Math.min(1, dot / (nu * nv || 1)))) * 180) / Math.PI;
  const Arrow = ({ s, from, to, cls }: { s: any; from: [number, number]; to: [number, number]; cls: string }) => {
    const [x1, y1, x2, y2] = [s.x(from[0]), s.y(from[1]), s.x(to[0]), s.y(to[1])];
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hd = 9;
    return (
      <g className={cls}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2.5} stroke="currentColor" />
        <polygon fill="currentColor" points={`${x2},${y2} ${x2 - hd * Math.cos(ang - 0.4)},${y2 - hd * Math.sin(ang - 0.4)} ${x2 - hd * Math.cos(ang + 0.4)},${y2 - hd * Math.sin(ang + 0.4)}`} />
      </g>
    );
  };
  return (
    <div>
      <WidgetTitle title="Vector playground">Adjust u (blue) and v (orange). The green arrow is u + v (place v’s tail at u’s head). Watch the dot product and angle.</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <Plot xDomain={[-6, 6]} yDomain={[-6, 6]} width={420} height={380} axesAtZero onClick={(x, y) => setU([Math.round(x), Math.round(y)])}>
          {(s) => (
            <>
              <line x1={s.x(u[0])} y1={s.y(u[1])} x2={s.x(sum[0])} y2={s.y(sum[1])} strokeDasharray="4 4" className="stroke-orange-300" />
              <Arrow s={s} from={[0, 0]} to={sum} cls="text-emerald-500" />
              <Arrow s={s} from={[0, 0]} to={u} cls="text-indigo-600 dark:text-indigo-400" />
              <Arrow s={s} from={[0, 0]} to={v} cls="text-orange-500" />
            </>
          )}
        </Plot>
        <div className="space-y-2">
          <Slider label="u₁" value={u[0]} min={-5} max={5} onChange={(x) => setU([x, u[1]])} />
          <Slider label="u₂" value={u[1]} min={-5} max={5} onChange={(y) => setU([u[0], y])} />
          <Slider label="v₁" value={v[0]} min={-5} max={5} onChange={(x) => setV([x, v[1]])} />
          <Slider label="v₂" value={v[1]} min={-5} max={5} onChange={(y) => setV([v[0], y])} />
          <div className="space-y-0.5 rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
            <div>u + v = [{sum.join(', ')}]</div>
            <div>u · v = {u[0]}·{v[0]} + {u[1]}·{v[1]} = <b>{dot}</b></div>
            <div>‖u‖ = {nu.toFixed(2)}, ‖v‖ = {nv.toFixed(2)}</div>
            <div>angle = {Number.isFinite(angle) ? angle.toFixed(1) : '—'}°</div>
          </div>
          <p className="text-xs text-slate-500">Dot product = 0 ⇒ perpendicular. Positive ⇒ pointing in similar directions. Click the grid to move u.</p>
        </div>
      </div>
    </div>
  );
}

export function MatrixMultiply() {
  const A = [[1, 2, 0], [3, -1, 4]];
  const B = [[2, 1], [0, 3], [-1, 5]];
  const C = A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
  const [cell, setCell] = useState<[number, number]>([0, 0]);
  const [i, j] = cell;
  const Cell = ({ v, hl, onClick }: { v: number; hl?: boolean; onClick?: () => void }) => (
    <button onClick={onClick} className={`h-10 w-10 rounded-md border font-mono text-sm ${hl ? 'border-indigo-500 bg-indigo-100 font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100' : 'border-slate-200 dark:border-slate-700'} ${onClick ? 'cursor-pointer hover:border-indigo-400' : 'cursor-default'}`}>{v}</button>
  );
  return (
    <div>
      <WidgetTitle title="Matrix multiplication, one cell at a time">Click any cell of the result C = A·B. Entry Cᵢⱼ is the dot product of row i of A with column j of B.</WidgetTitle>
      <div className="flex flex-wrap items-center gap-4">
        <div><div className="mb-1 text-xs text-slate-500">A (2×3)</div>{A.map((r, ri) => <div key={ri} className="flex gap-1 pb-1">{r.map((v, ci) => <Cell key={ci} v={v} hl={ri === i} />)}</div>)}</div>
        <span className="text-xl">×</span>
        <div><div className="mb-1 text-xs text-slate-500">B (3×2)</div>{B.map((r, ri) => <div key={ri} className="flex gap-1 pb-1">{r.map((v, ci) => <Cell key={ci} v={v} hl={ci === j} />)}</div>)}</div>
        <span className="text-xl">=</span>
        <div><div className="mb-1 text-xs text-slate-500">C (2×2)</div>{C.map((r, ri) => <div key={ri} className="flex gap-1 pb-1">{r.map((v, ci) => <Cell key={ci} v={v} hl={ri === i && ci === j} onClick={() => setCell([ri, ci])} />)}</div>)}</div>
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm dark:bg-slate-800">
        C<sub>{i + 1}{j + 1}</sub> = {A[i].map((a, k) => `(${a})(${B[k][j]})`).join(' + ')} = <b>{C[i][j]}</b>
      </div>
      <p className="mt-2 text-xs text-slate-500">Shapes must line up: (2×<b>3</b>)·(<b>3</b>×2) → 2×2. The inner dimensions must match; the outer ones give the result’s shape.</p>
    </div>
  );
}

export function GradientDescent() {
  const [lr, setLr] = useState(0.1);
  const [start, setStart] = useState(-4);
  const [steps, setSteps] = useState(10);
  const f = (x: number) => (x - 1) * (x - 1) + 1;
  const df = (x: number) => 2 * (x - 1);
  const trail: number[] = [start];
  for (let k = 0; k < steps; k++) {
    const x = trail[trail.length - 1];
    trail.push(x - lr * df(x));
  }
  const curve: [number, number][] = [];
  for (let x = -5; x <= 7.001; x += 0.05) curve.push([x, f(x)]);
  const last = trail[trail.length - 1];
  const diverged = !Number.isFinite(last) || Math.abs(last) > 50;
  return (
    <div>
      <WidgetTitle title="Gradient descent">Minimise f(x) = (x − 1)² + 1. Each step moves x against the slope: x ← x − learning_rate · f′(x).</WidgetTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_230px]">
        <Plot xDomain={[-5, 7]} yDomain={[0, 40]} xLabel="x (parameter)" yLabel="loss f(x)">
          {(s) => (
            <>
              <path d={path(curve.map((p) => [s.x(p[0]), s.y(p[1])]))} className="fill-none stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2.5} />
              <path d={path(trail.filter((x) => Math.abs(x) < 50).map((x) => [s.x(x), s.y(f(x))]))} className="fill-none stroke-orange-400" strokeWidth={1.5} />
              {trail.filter((x) => Math.abs(x) < 50).map((x, k) => <circle key={k} cx={s.x(x)} cy={s.y(f(x))} r={k === trail.length - 1 ? 6 : 3.5} className={k === trail.length - 1 ? 'fill-emerald-500' : 'fill-orange-500'} />)}
            </>
          )}
        </Plot>
        <div className="space-y-3">
          <Slider label="Learning rate" value={lr} min={0.01} max={1.1} step={0.01} onChange={setLr} format={(v) => v.toFixed(2)} />
          <Slider label="Start x" value={start} min={-4.5} max={6.5} step={0.5} onChange={setStart} />
          <Slider label="Steps" value={steps} min={0} max={40} onChange={setSteps} />
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800">
            {diverged ? <span className="text-rose-600">Diverged! The learning rate is too large.</span> : <>x = {last.toFixed(4)}<br />f(x) = {f(last).toFixed(4)}<br />(minimum: x = 1, f = 1)</>}
          </div>
          <p className="text-xs text-slate-500">Try 0.01 (slow), 0.5 (jumps straight there), 0.95 (zig-zags) and 1.05 (explodes).</p>
        </div>
      </div>
    </div>
  );
}
