import type { ReactNode } from 'react';

export interface Scale {
  x: (v: number) => number;
  y: (v: number) => number;
  invX: (px: number) => number;
  invY: (py: number) => number;
  w: number;
  h: number;
}

function ticks(min: number, max: number, n = 6) {
  const span = max - min;
  const step0 = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

interface PlotProps {
  xDomain: [number, number];
  yDomain: [number, number];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  children: (s: Scale) => ReactNode;
  onClick?: (x: number, y: number) => void;
  axesAtZero?: boolean;
}

/** Minimal responsive SVG chart with axes and a scale passed to children. */
export function Plot({ xDomain, yDomain, width = 520, height = 300, xLabel, yLabel, children, onClick, axesAtZero }: PlotProps) {
  const m = { l: 44, r: 12, t: 10, b: 36 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;
  const [x0, x1] = xDomain;
  const [y0, y1] = yDomain;
  const s: Scale = {
    x: (v) => m.l + ((v - x0) / (x1 - x0)) * w,
    y: (v) => m.t + h - ((v - y0) / (y1 - y0)) * h,
    invX: (px) => x0 + ((px - m.l) / w) * (x1 - x0),
    invY: (py) => y0 + ((m.t + h - py) / h) * (y1 - y0),
    w,
    h,
  };
  const handle = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onClick) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    if (p.x < m.l || p.x > m.l + w || p.y < m.t || p.y > m.t + h) return;
    onClick(s.invX(p.x), s.invY(p.y));
  };
  const xAxisY = axesAtZero && y0 < 0 && y1 > 0 ? s.y(0) : m.t + h;
  const yAxisX = axesAtZero && x0 < 0 && x1 > 0 ? s.x(0) : m.l;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full select-none ${onClick ? 'cursor-crosshair' : ''}`} onClick={handle} role="img">
      <rect x={m.l} y={m.t} width={w} height={h} className="fill-slate-50 dark:fill-slate-950/60" />
      {ticks(x0, x1).map((t) => (
        <g key={`x${t}`}>
          <line x1={s.x(t)} x2={s.x(t)} y1={m.t} y2={m.t + h} className="stroke-slate-200 dark:stroke-slate-800" />
          <text x={s.x(t)} y={m.t + h + 14} textAnchor="middle" className="fill-slate-500 text-[10px]">{t}</text>
        </g>
      ))}
      {ticks(y0, y1, 5).map((t) => (
        <g key={`y${t}`}>
          <line x1={m.l} x2={m.l + w} y1={s.y(t)} y2={s.y(t)} className="stroke-slate-200 dark:stroke-slate-800" />
          <text x={m.l - 6} y={s.y(t) + 3} textAnchor="end" className="fill-slate-500 text-[10px]">{t}</text>
        </g>
      ))}
      <line x1={m.l} x2={m.l + w} y1={xAxisY} y2={xAxisY} className="stroke-slate-400 dark:stroke-slate-600" />
      <line x1={yAxisX} x2={yAxisX} y1={m.t} y2={m.t + h} className="stroke-slate-400 dark:stroke-slate-600" />
      {xLabel && <text x={m.l + w / 2} y={height - 4} textAnchor="middle" className="fill-slate-600 text-[11px] dark:fill-slate-400">{xLabel}</text>}
      {yLabel && <text x={12} y={m.t + h / 2} textAnchor="middle" transform={`rotate(-90 12 ${m.t + h / 2})`} className="fill-slate-600 text-[11px] dark:fill-slate-400">{yLabel}</text>}
      <svg x={m.l} y={m.t} width={w} height={h} overflow="hidden" viewBox={`${m.l} ${m.t} ${w} ${h}`}>{children(s)}</svg>
    </svg>
  );
}

export const path = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');

export function Slider({ label, value, min, max, step = 1, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between"><span className="font-medium">{label}</span><span className="font-mono text-indigo-600 dark:text-indigo-400">{format ? format(value) : value}</span></span>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function WidgetTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      {children && <p className="text-sm text-slate-500">{children}</p>}
    </div>
  );
}

/** Seeded PRNG + normal sampler for reproducible simulations. */
export function makeRng(seed = 1) {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    let u = 0;
    while (u === 0) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  return { rand, normal };
}

export const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
export const std = (a: number[], ddof = 1) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - ddof));
};
