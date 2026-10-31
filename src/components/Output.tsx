import type { OutputItem } from '../lib/python';
import type { SqlResult } from '../lib/sql';

export function OutputPanel({ items, placeholder = 'Output will appear here.' }: { items: OutputItem[]; placeholder?: string }) {
  if (!items.length) return <div className="px-4 py-3 font-mono text-xs text-slate-400">{placeholder}</div>;
  return (
    <div className="max-h-[480px] space-y-2 overflow-auto px-4 py-3 text-sm">
      {merge(items).map((o, i) => {
        if (o.kind === 'image') return <img key={i} src={`data:image/png;base64,${o.png}`} alt="Plot output" className="max-w-full rounded-lg bg-white" />;
        if (o.kind === 'html')
          // HTML comes only from pandas' to_html(), which escapes cell contents.
          return <div key={i} className="overflow-auto" dangerouslySetInnerHTML={{ __html: o.html }} />;
        const color =
          o.kind === 'error' ? 'text-rose-600 dark:text-rose-400' : o.kind === 'stderr' ? 'text-amber-600 dark:text-amber-400' : o.kind === 'text' ? 'text-indigo-700 dark:text-indigo-300' : '';
        return (
          <pre key={i} className={`whitespace-pre-wrap break-words font-mono text-[13px] ${color}`}>
            {o.text.replace(/\n$/, '')}
          </pre>
        );
      })}
    </div>
  );
}

// Join consecutive stdout chunks into one block.
function merge(items: OutputItem[]): OutputItem[] {
  const out: OutputItem[] = [];
  for (const it of items) {
    const prev = out[out.length - 1];
    if (prev && (it.kind === 'stdout' || it.kind === 'stderr') && prev.kind === it.kind) out[out.length - 1] = { kind: it.kind, text: prev.text + it.text };
    else out.push(it);
  }
  return out;
}

export function SqlTable({ result }: { result: SqlResult }) {
  const shown = result.values.slice(0, 200);
  return (
    <div className="overflow-auto">
      <table className="df">
        <thead>
          <tr>
            {result.columns.map((c, i) => (
              <th key={i} className="!text-left">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className={typeof v === 'number' ? '' : '!text-left'}>
                  {v === null ? <span className="text-slate-400">NULL</span> : typeof v === 'number' ? fmt(v) : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1 text-xs text-slate-500">
        {result.values.length} row{result.values.length === 1 ? '' : 's'}
        {result.values.length > 200 ? ' (showing first 200)' : ''}
      </div>
    </div>
  );
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 10000) / 10000));
