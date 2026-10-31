// Content QA: executes every code example and exercise in the same runtimes the app uses
// (Pyodide for Python, sql.js for SQLite) and checks quiz/exercise structure.
//   node scripts/validate-content.ts            # everything
//   node scripts/validate-content.ts python     # only modules whose id contains "python"
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { loadPyodide } from 'pyodide';
import { MODULES, PROJECTS } from '../src/content/index.ts';
import { DATABASES } from '../src/content/databases.ts';

const require = createRequire(import.meta.url);
const filter = process.argv[2];
const root = resolve(import.meta.dirname, '..');
const errors: string[] = [];
const warnings: string[] = [];
let checks = 0;

// ---------- structural checks ----------
const ids = new Set<string>();
const uniq = (id: string, where: string) => {
  if (ids.has(id)) errors.push(`Duplicate id "${id}" (${where})`);
  ids.add(id);
};
for (const m of MODULES) {
  for (const l of m.lessons) {
    uniq(`lesson:${l.id}`, m.id);
    const req: (keyof typeof l)[] = ['objectives', 'intro', 'simple', 'technical', 'terms', 'realWorld', 'steps', 'mistakes', 'exercises', 'quiz', 'summary', 'resources'];
    for (const k of req) {
      const v = l[k] as unknown;
      if (!v || (Array.isArray(v) && v.length === 0)) errors.push(`${l.id}: missing ${String(k)}`);
    }
    if (l.quiz.length < 4) warnings.push(`${l.id}: only ${l.quiz.length} quiz questions`);
    if (l.exercises.length < 2) warnings.push(`${l.id}: only ${l.exercises.length} exercises`);
    for (const q of l.quiz) {
      uniq(`q:${l.id}:${q.id}`, l.id);
      if (q.kind === 'mcq' && (q.answer < 0 || q.answer >= q.options.length)) errors.push(`${l.id}/${q.id}: answer index out of range`);
      if (q.kind === 'text' && !q.accepted.length) errors.push(`${l.id}/${q.id}: no accepted answers`);
    }
    for (const e of l.exercises) {
      uniq(`ex:${e.id}`, l.id);
      if (!e.hints.length) warnings.push(`${e.id}: no hints`);
      if (e.lang === 'python' && !e.accepted && !e.tests) errors.push(`${e.id}: python exercise without tests`);
      if (e.lang === 'sql' && !e.db && !e.accepted) warnings.push(`${e.id}: sql exercise without db (defaults to shop)`);
    }
  }
}

// ---------- Python ----------
const py = await loadPyodide();
await py.loadPackage(['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'scipy', 'micropip', 'sqlite3'], { messageCallback: () => {} });
await py.runPythonAsync('import micropip\nawait micropip.install("seaborn")');
py.FS.mkdirTree('/home/pyodide/data');
for (const f of ['students', 'expenses', 'sales', 'mall_customers', 'churn', 'houses', 'pandemic_cases', 'stock_prices', 'messy_customers']) {
  py.FS.writeFile(`/home/pyodide/data/${f}.csv`, readFileSync(resolve(root, 'public/datasets', `${f}.csv`)));
}
py.FS.chdir('/home/pyodide');
py.runPython(`
import os, io, sys, ast, warnings, traceback
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore")
def _check(code, tests=None):
    if "matplotlib.pyplot" in sys.modules:
        sys.modules["matplotlib.pyplot"].close("all")
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    try:
        tree = ast.parse(code)
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, "<code>", "exec"), ns)
        if last is not None:
            eval(compile(last, "<code>", "eval"), ns)
    except BaseException:
        sys.stdout = old
        return "ERROR: " + traceback.format_exc(limit=3)
    finally:
        sys.stdout = old
    try:
        if tests:
            ns["_out"] = buf.getvalue()
            try:
                exec(compile(tests, "<tests>", "exec"), ns)
            except AssertionError as e:
                return "TESTFAIL: " + str(e)
            except BaseException:
                return "TESTERROR: " + traceback.format_exc(limit=2)
        return None
    finally:
        if "matplotlib.pyplot" in sys.modules:
            sys.modules["matplotlib.pyplot"].close("all")
`);
const check = py.globals.get('_check');
const runPy = (code: string, tests?: string): string | undefined => check(code, tests ?? null) ?? undefined;

// ---------- SQL ----------
const initSqlJs = require('sql.js');
const SQL = await initSqlJs({ locateFile: (f: string) => resolve(root, 'node_modules/sql.js/dist', f) });
const freshDb = (id: string) => {
  const d = new SQL.Database();
  d.exec((DATABASES.find((x) => x.id === id) ?? DATABASES[0]).sql);
  return d;
};
const runSql = (db: string, q: string) => {
  const d = freshDb(db);
  try {
    return { res: d.exec(q) };
  } catch (e) {
    return { err: String((e as Error).message) };
  } finally {
    d.close();
  }
};

for (const m of MODULES) {
  if (filter && !m.id.includes(filter)) continue;
  process.stdout.write(`Module ${m.number} (${m.id}) `);
  for (const l of m.lessons) {
    l.code.forEach((c, i) => {
      if (c.runnable === false) return;
      checks++;
      if ((c.lang ?? 'python') === 'sql') {
        const r = runSql(c.db ?? 'shop', c.code);
        if (r.err) errors.push(`${l.id} code#${i + 1} SQL error: ${r.err}`);
      } else {
        const e = runPy(c.code);
        if (c.expectsError) {
          if (!e) errors.push(`${l.id} code#${i + 1} "${c.title}": marked expectsError but ran without an error`);
        } else if (e) errors.push(`${l.id} code#${i + 1} "${c.title}": ${e}`);
      }
      process.stdout.write('.');
    });
    for (const ex of l.exercises) {
      if (ex.accepted) continue;
      checks++;
      if (ex.lang === 'sql') {
        const r = runSql(ex.db ?? 'shop', ex.solution);
        if (r.err) errors.push(`${ex.id} solution SQL error: ${r.err}`);
        else if (!r.res?.length || !r.res.at(-1).values.length) warnings.push(`${ex.id}: solution returns no rows`);
        if (ex.starter) {
          const s = runSql(ex.db ?? 'shop', ex.starter);
          if (!s.err && JSON.stringify(s.res?.at(-1)?.values) === JSON.stringify(r.res?.at(-1)?.values)) warnings.push(`${ex.id}: starter already produces the solution result`);
        }
      } else {
        const e = runPy(ex.solution, ex.tests);
        if (e) errors.push(`${ex.id} solution fails: ${e}`);
        const s = runPy(ex.starter ?? '', ex.tests);
        if (!s) errors.push(`${ex.id}: starter code already passes the tests (tests too weak)`);
      }
      process.stdout.write('·');
    }
  }
  process.stdout.write('\n');
}

if (!filter) {
  for (const p of PROJECTS) {
    checks++;
    const e = runPy(p.starter);
    if (e) errors.push(`project ${p.id} starter: ${e}`);
    p.steps.forEach((s, i) => {
      if (!s.code) return;
      checks++;
      const se = runPy(p.steps.slice(0, i + 1).map((x) => x.code ?? '').join('\n'));
      if (se) errors.push(`project ${p.id} step ${i + 1} (cumulative): ${se}`);
    });
  }
}

const lessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
const exercises = MODULES.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.exercises.length, 0), 0);
const questions = MODULES.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.quiz.length, 0), 0);
console.log(`\n${MODULES.length} modules · ${lessons} lessons · ${exercises} exercises · ${questions} quiz questions · ${PROJECTS.length} projects`);
console.log(`${checks} executable checks run`);
warnings.forEach((w) => console.log('WARN ', w));
errors.forEach((e) => console.log('ERROR', e));
console.log(errors.length ? `\n✗ ${errors.length} error(s)` : '\n✓ All content checks passed');
process.exit(errors.length ? 1 : 0);
