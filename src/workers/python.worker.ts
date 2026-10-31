/// <reference lib="webworker" />
// Runs real CPython (Pyodide/WebAssembly) off the main thread. Code executes inside the
// browser sandbox: no access to your files or network beyond what the browser allows.

const PYODIDE_VERSION = '0.29.5';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const DATASETS = [
  'students.csv', 'expenses.csv', 'sales.csv', 'mall_customers.csv', 'churn.csv',
  'houses.csv', 'pandemic_cases.csv', 'stock_prices.csv', 'messy_customers.csv',
];

type InMsg =
  | { type: 'init' }
  | { type: 'run'; id: number; code: string; stdin?: string; tests?: string; namespace?: string }
  | { type: 'reset'; namespace: string };

const post = (m: unknown) => (self as unknown as Worker).postMessage(m);

let pyodide: any = null;
let ready: Promise<void> | null = null;
let currentId = 0;

const HELPERS = String.raw`
import sys, io, ast, base64, traceback, warnings, os
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore", message=".*non-interactive.*")
warnings.filterwarnings("ignore", message=".*FigureCanvasAgg.*")
_namespaces = {}

def _ns(name):
    if name not in _namespaces:
        _namespaces[name] = {"__name__": "__main__"}
    return _namespaces[name]

def _reset(name):
    _namespaces.pop(name, None)

def _format_exc(e, filename):
    tb = traceback.TracebackException.from_exception(e)
    tb.stack = traceback.StackSummary.from_list([f for f in tb.stack if f.filename == filename])
    return "".join(tb.format())

def _figures():
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        fig = plt.figure(n)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out

def _display(value):
    """Return (kind, payload) for the value of a trailing expression, like Jupyter."""
    if value is None:
        return None
    try:
        import pandas as pd
        if isinstance(value, pd.DataFrame):
            return ("html", value.to_html(max_rows=30, max_cols=20, border=0, classes="df"))
        if isinstance(value, pd.Series):
            return ("html", value.to_frame().to_html(max_rows=30, border=0, classes="df"))
    except ImportError:
        pass
    return ("text", repr(value))

def _run(code, ns_name, filename="<your code>"):
    ns = _ns(ns_name)
    try:
        tree = ast.parse(code, filename)
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, filename, "exec"), ns)
        shown = None
        if last is not None:
            shown = _display(eval(compile(last, filename, "eval"), ns))
        return {"error": None, "display": shown}
    except SystemExit:
        return {"error": None, "display": None}
    except BaseException as e:
        msg = _format_exc(e, filename)
        if isinstance(e, EOFError):
            msg += "\nHint: your code called input(). Type the input values (one per line) in the Input box and run again."
        return {"error": msg, "display": None}

def _run_tests(tests, ns_name, out_text):
    ns = _ns(ns_name)
    ns["_out"] = out_text
    try:
        exec(compile(tests, "<tests>", "exec"), ns)
        return None
    except AssertionError as e:
        return str(e) or _explain_failed_assert(tests, ns, e)
    except NameError as e:
        name = getattr(e, "name", None) or str(e)
        return f"The checker looked for `{name}`, but your code doesn't define it. Check the spelling and that you assign it as the task asks."
    except Exception as e:
        return f"{type(e).__name__}: {e}"

def _explain_failed_assert(tests, ns, err):
    # Bare asserts carry no message: show the failing check and, for comparisons, both values.
    lineno = None
    for frame in traceback.extract_tb(err.__traceback__):
        if frame.filename == "<tests>":
            lineno = frame.lineno
    line = tests.splitlines()[lineno - 1].strip() if lineno else ""
    msg = f"This check failed:\n    {line}" if line else "A check failed. Re-read the task and compare your output."
    try:
        test = ast.parse(line).body[0].test
        if isinstance(test, ast.Compare) and len(test.ops) == 1:
            left = eval(compile(ast.Expression(test.left), "<tests>", "eval"), ns)
            right = eval(compile(ast.Expression(test.comparators[0]), "<tests>", "eval"), ns)
            op = {ast.Eq: "expected", ast.Lt: "needed a value below", ast.LtE: "needed at most", ast.Gt: "needed a value above", ast.GtE: "needed at least"}.get(type(test.ops[0]))
            if op:
                msg += f"\nYour result: {left!r}\nThe check {op}: {right!r}"
    except Exception:
        pass
    return msg
`;

async function init() {
  post({ type: 'status', status: 'loading', detail: 'Downloading Python runtime…' });
  const { loadPyodide } = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`);
  pyodide = await loadPyodide({ indexURL: INDEX_URL });
  post({ type: 'status', status: 'loading', detail: 'Loading datasets…' });
  pyodide.FS.mkdirTree('/home/pyodide/data');
  await Promise.all(
    DATASETS.map(async (f) => {
      try {
        const res = await fetch(`/datasets/${f}`);
        if (res.ok) pyodide.FS.writeFile(`/home/pyodide/data/${f}`, new Uint8Array(await res.arrayBuffer()));
      } catch {
        /* dataset missing: lessons that need it will show a FileNotFoundError */
      }
    }),
  );
  pyodide.runPython(HELPERS);
  post({ type: 'status', status: 'ready' });
}

let seabornInstalled = false;
async function ensurePackages(code: string) {
  await pyodide.loadPackagesFromImports(code, {
    messageCallback: (m: string) => post({ type: 'status', status: 'packages', detail: m }),
    errorCallback: () => {},
  });
  if (!seabornInstalled && /^\s*(import|from)\s+seaborn/m.test(code)) {
    post({ type: 'status', status: 'packages', detail: 'Installing seaborn…' });
    await pyodide.loadPackage(['micropip', 'matplotlib', 'pandas', 'scipy']);
    await pyodide.runPythonAsync(`import micropip\nawait micropip.install("seaborn")`);
    seabornInstalled = true;
  }
}

async function run(msg: Extract<InMsg, { type: 'run' }>) {
  currentId = msg.id;
  const ns = msg.namespace || `run-${msg.id}`;
  let out = '';
  pyodide.setStdout({ batched: (s: string) => { out += s + '\n'; post({ type: 'stdout', id: msg.id, text: s + '\n' }); } });
  pyodide.setStderr({ batched: (s: string) => post({ type: 'stderr', id: msg.id, text: s + '\n' }) });
  const lines = (msg.stdin ?? '').split('\n');
  if (!msg.stdin) lines.length = 0;
  pyodide.setStdin({ stdin: () => (lines.length ? lines.shift() : undefined) });

  try {
    await ensurePackages(msg.code + '\n' + (msg.tests ?? ''));
    post({ type: 'status', status: 'running' });
    const runPy = pyodide.globals.get('_run');
    const result = runPy(msg.code, ns).toJs({ dict_converter: Object.fromEntries });
    runPy.destroy();

    // Tests run before figures are captured (and closed) so they can inspect plots.
    let testError: string | null | undefined;
    if (msg.tests && !result.error) {
      const runTests = pyodide.globals.get('_run_tests');
      testError = runTests(msg.tests, ns, out);
      runTests.destroy();
    }
    const figs: string[] = pyodide.globals.get('_figures')().toJs();
    for (const png of figs) post({ type: 'image', id: msg.id, png });
    if (result.display) post({ type: 'display', id: msg.id, kind: result.display[0], value: result.display[1] });
    if (!msg.namespace) pyodide.globals.get('_reset')(ns);
    post({ type: 'done', id: msg.id, error: result.error, testError: msg.tests ? (result.error ? 'Your code raised an error.' : (testError ?? null)) : undefined });
  } catch (e) {
    post({ type: 'done', id: msg.id, error: String((e as Error).message || e) });
  } finally {
    post({ type: 'status', status: 'ready' });
  }
}

let queue: Promise<void> = Promise.resolve();
self.onmessage = (ev: MessageEvent<InMsg>) => {
  const msg = ev.data;
  if (msg.type === 'init') {
    ready ??= init().catch((e) => {
      ready = null;
      post({ type: 'status', status: 'error', detail: `Could not load Python: ${e?.message || e}. Check your internet connection (the runtime is downloaded from cdn.jsdelivr.net on first use).` });
      throw e;
    });
    return;
  }
  queue = queue.then(async () => {
    try {
      await ready;
    } catch {
      if (msg.type === 'run') post({ type: 'done', id: msg.id, error: 'Python runtime failed to load.' });
      return;
    }
    if (msg.type === 'run') await run(msg);
    else if (msg.type === 'reset') pyodide.globals.get('_reset')(msg.namespace);
  });
};
void currentId;
