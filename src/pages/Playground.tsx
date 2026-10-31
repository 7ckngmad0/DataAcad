import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, ArrowUp, ArrowDown, Play, RefreshCcw, FileText, Code2, Eye, Pencil, PlayCircle, Loader2 } from 'lucide-react';
import { CodeRunner, PythonStatusBadge } from '../components/CodeRunner';
import { CodeEditor } from '../components/CodeEditor';
import { OutputPanel } from '../components/Output';
import { Markdown } from '../components/Markdown';
import { PageHeader } from '../components/ui';
import { resetNamespace, runPython, type OutputItem } from '../lib/python';
import { DATABASES } from '../content/databases';
import { SqlSchema } from '../components/widgets/SqlSchema';

const TABS = [
  ['python', 'Python scratchpad'],
  ['notebook', 'Notebook'],
  ['sql', 'SQL playground'],
  ['datasets', 'Datasets'],
] as const;

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

const SCRATCH_DEFAULT = `# Python scratchpad — experiment freely! Press Ctrl+Enter to run.
# Variables persist between runs (like a notebook). Datasets live in data/
import pandas as pd

df = pd.read_csv("data/students.csv")
print(df.shape)
df.head()`;

function Scratchpad() {
  const [code, setCode] = useState(() => load('dsa-scratch', SCRATCH_DEFAULT));
  useEffect(() => {
    const t = setTimeout(() => save('dsa-scratch', code), 400);
    return () => clearTimeout(t);
  }, [code]);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Your code is saved automatically in this browser. Variables persist between runs; use “Restart” to clear them.</p>
      <CodeRunner
        code={load('dsa-scratch', SCRATCH_DEFAULT)}
        onCodeChange={setCode}
        namespace="scratch"
        minHeight="260px"
        extraButtons={
          <button className="btn-ghost !px-2 !py-1.5" title="Restart (clear variables)" onClick={() => resetNamespace('scratch')}>
            <RefreshCcw size={15} />
          </button>
        }
      />
    </div>
  );
}

interface Cell {
  id: number;
  type: 'code' | 'markdown';
  source: string;
  output?: OutputItem[];
  editing?: boolean;
  count?: number;
}

const NB_DEFAULT: Cell[] = [
  { id: 1, type: 'markdown', source: '# My first notebook\nNotebooks mix **explanations** (Markdown cells) with **code** (code cells). Run a cell with **Shift+Enter** or ▶.' },
  { id: 2, type: 'code', source: 'import pandas as pd\nsales = pd.read_csv("data/sales.csv")\nsales.head()' },
  { id: 3, type: 'code', source: '# Variables from earlier cells are still available:\nsales.groupby("region")["revenue"].sum().sort_values(ascending=False)' },
  { id: 4, type: 'code', source: 'import matplotlib.pyplot as plt\nsales.groupby("category")["revenue"].sum().plot(kind="bar", color="#6366f1")\nplt.title("Revenue by category")\nplt.ylabel("Revenue ($)")\nplt.show()' },
];

function Notebook() {
  const [cells, setCells] = useState<Cell[]>(() => load<Cell[]>('dsa-notebook', NB_DEFAULT).map((c) => ({ ...c, output: undefined })));
  const [running, setRunning] = useState<number | null>(null);
  const counter = useRef(1);
  useEffect(() => save('dsa-notebook', cells.map(({ id, type, source }) => ({ id, type, source }))), [cells]);

  const upd = (id: number, p: Partial<Cell>) => setCells((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));
  const runCell = async (id: number) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell) return;
    if (cell.type === 'markdown') return upd(id, { editing: false });
    setRunning(id);
    upd(id, { output: [] });
    const items: OutputItem[] = [];
    const r = await runPython(cell.source, { namespace: 'notebook', onOutput: (o) => { items.push(o); upd(id, { output: [...items] }); } });
    const n = counter.current++;
    upd(id, { output: r.output, count: n });
    setRunning(null);
  };
  const runAll = async () => {
    for (const c of cells) {
      if (c.type === 'code') await runCell(c.id);
    }
  };
  const add = (i: number, type: Cell['type']) =>
    setCells((cs) => [...cs.slice(0, i + 1), { id: Date.now(), type, source: '', editing: true }, ...cs.slice(i + 1)]);
  const move = (i: number, d: number) =>
    setCells((cs) => {
      const j = i + d;
      if (j < 0 || j >= cs.length) return cs;
      const c = [...cs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={runAll} disabled={running !== null}><PlayCircle size={16} /> Run all</button>
        <button className="btn-secondary" onClick={() => { resetNamespace('notebook'); setCells((cs) => cs.map((c) => ({ ...c, output: undefined, count: undefined }))); counter.current = 1; }}>
          <RefreshCcw size={15} /> Restart kernel
        </button>
        <button className="btn-ghost" onClick={() => { if (confirm('Replace your notebook with the example notebook?')) setCells(NB_DEFAULT); }}>Load example</button>
        <span className="ml-auto"><PythonStatusBadge /></span>
      </div>
      {cells.map((c, i) => (
        <div key={c.id} className="group card overflow-hidden">
          <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-800/50">
            <span className="w-14 font-mono text-slate-400">{c.type === 'code' ? `[${c.count ?? ' '}]` : 'Md'}</span>
            <button className="btn-ghost !p-1" onClick={() => runCell(c.id)} title="Run cell (Shift+Enter)" disabled={running !== null}>
              {running === c.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            </button>
            {c.type === 'markdown' && (
              <button className="btn-ghost !p-1" onClick={() => upd(c.id, { editing: !c.editing })} title={c.editing ? 'Preview' : 'Edit'}>
                {c.editing ? <Eye size={14} /> : <Pencil size={14} />}
              </button>
            )}
            <span className="ml-auto" />
            <button className="btn-ghost !p-1" onClick={() => move(i, -1)} title="Move up"><ArrowUp size={14} /></button>
            <button className="btn-ghost !p-1" onClick={() => move(i, 1)} title="Move down"><ArrowDown size={14} /></button>
            <button className="btn-ghost !p-1" onClick={() => add(i, 'code')} title="Add code cell below"><Code2 size={14} /></button>
            <button className="btn-ghost !p-1" onClick={() => add(i, 'markdown')} title="Add Markdown cell below"><FileText size={14} /></button>
            <button className="btn-ghost !p-1 hover:text-rose-600" onClick={() => setCells((cs) => cs.filter((x) => x.id !== c.id))} title="Delete cell"><Trash2 size={14} /></button>
          </div>
          {c.type === 'code' || c.editing ? (
            <CodeEditor value={c.source} onChange={(v) => upd(c.id, { source: v })} lang="python" onRun={() => runCell(c.id)} minHeight="40px" />
          ) : (
            <div className="cursor-text p-4" onDoubleClick={() => upd(c.id, { editing: true })}>
              <Markdown>{c.source || '_Empty Markdown cell — double-click to edit._'}</Markdown>
            </div>
          )}
          {c.type === 'code' && c.output && c.output.length > 0 && <div className="border-t border-slate-200 dark:border-slate-800"><OutputPanel items={c.output} /></div>}
        </div>
      ))}
      <div className="flex gap-2">
        <button className="btn-secondary" onClick={() => add(cells.length - 1, 'code')}><Plus size={15} /> Code cell</button>
        <button className="btn-secondary" onClick={() => add(cells.length - 1, 'markdown')}><Plus size={15} /> Markdown cell</button>
      </div>
    </div>
  );
}

function SqlPlayground() {
  const [db, setDb] = useState('shop');
  const d = DATABASES.find((x) => x.id === db)!;
  const starter = db === 'shop'
    ? '-- Which product categories bring in the most revenue?\nSELECT p.category,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.category\nORDER BY revenue DESC;'
    : '-- Average salary per department\nSELECT d.name AS department, ROUND(AVG(e.salary)) AS avg_salary, COUNT(*) AS headcount\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nGROUP BY d.name\nORDER BY avg_salary DESC;';
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">Database</label>
          <select className="input !w-auto" aria-label="Practice database" value={db} onChange={(e) => setDb(e.target.value)}>
            {DATABASES.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
        </div>
        <p className="text-sm text-slate-500">{d.description} Changes (INSERT/UPDATE/DELETE) stay until you reset the database with the 🗄 button.</p>
        <CodeRunner key={db} code={starter} lang="sql" db={db} minHeight="180px" persistDb />
      </div>
      <div className="card p-4"><SqlSchema db={db} /></div>
    </div>
  );
}

const DATASETS: [string, string][] = [
  ['students.csv', '120 students: study hours, attendance, test scores, pass/fail.'],
  ['expenses.csv', 'One year of personal expenses by category and payment method.'],
  ['sales.csv', '1,500 retail orders (2024–2025): region, category, product, units, price, discount, revenue.'],
  ['mall_customers.csv', '216 mall customers: age, income, spending score — great for clustering.'],
  ['churn.csv', '1,200 telecom customers with contract details and whether they churned.'],
  ['houses.csv', '800 houses: size, rooms, age, neighborhood and sale price.'],
  ['pandemic_cases.csv', 'Daily COVID-19-style case/death counts for 5 fictional countries in 2021 (includes reporting gaps).'],
  ['stock_prices.csv', 'Three years of simulated daily closing prices and volume for a fictional stock.'],
  ['messy_customers.csv', 'A deliberately messy customer table: missing values, duplicates, typos, wrong types, outliers.'],
];

function Datasets() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        All datasets are <b>synthetic</b> (generated by <code>scripts/gen_datasets.py</code> with a fixed seed) but realistic in structure. In any Python editor they are available as <code>data/&lt;file&gt;</code>; you can also download them.
      </p>
      {DATASETS.map(([f, d]) => (
        <div key={f} className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono font-semibold">{f}</span>
            <span className="flex-1 text-sm text-slate-500">{d}</span>
            <a className="btn-secondary !py-1.5" href={`/datasets/${f}`} download>Download</a>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400">Explore in Python</summary>
            <div className="mt-2">
              <CodeRunner code={`import pandas as pd\ndf = pd.read_csv("data/${f}")\nprint(df.shape)\nprint(df.dtypes)\ndf.head()`} />
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}

export function Playground() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'python';
  return (
    <div>
      <PageHeader title="Coding Playground" subtitle="Real Python 3 (Pyodide/WebAssembly) and SQLite running entirely in your browser — numpy, pandas, matplotlib, seaborn and scikit-learn included." />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setParams({ tab: id })} className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${tab === id ? 'bg-white shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'python' && <Scratchpad />}
      {tab === 'notebook' && <Notebook />}
      {tab === 'sql' && <SqlPlayground />}
      {tab === 'datasets' && <Datasets />}
    </div>
  );
}
