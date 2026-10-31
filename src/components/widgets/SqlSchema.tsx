import { useEffect, useState } from 'react';
import { openDb } from '../../lib/sql';
import { DATABASES } from '../../content/databases';

interface Col { name: string; type: string; pk: boolean; fk?: string }
interface Table { name: string; rows: number; cols: Col[] }

/** Reads the live schema (tables, columns, keys, row counts) from the SQLite database. */
export function SqlSchema({ db = 'shop' }: { db?: string }) {
  const [tables, setTables] = useState<Table[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    openDb(db)
      .then((d) => {
        const names = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0]?.values.map((v) => String(v[0])) ?? [];
        const out = names.map((n) => {
          const info = d.exec(`PRAGMA table_info(${n})`)[0].values;
          const fks = d.exec(`PRAGMA foreign_key_list(${n})`)[0]?.values ?? [];
          const rows = Number(d.exec(`SELECT COUNT(*) FROM ${n}`)[0].values[0][0]);
          return {
            name: n,
            rows,
            cols: info.map((c) => {
              const fk = fks.find((f) => f[3] === c[1]);
              return { name: String(c[1]), type: String(c[2]), pk: Number(c[5]) > 0, fk: fk ? `${fk[2]}.${fk[4]}` : undefined };
            }),
          };
        });
        d.close();
        if (!cancelled) setTables(out);
      })
      .catch((e) => setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [db]);
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!tables) return <p className="text-sm text-slate-500">Loading schema…</p>;
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">Schema: {DATABASES.find((d) => d.id === db)?.title}</div>
      <div className="grid gap-3">
        {tables.map((t) => (
          <div key={t.name} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white">{t.name}<span className="font-normal text-indigo-200">{t.rows} rows</span></div>
            <ul className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {t.cols.map((c) => (
                <li key={c.name} className="flex items-center gap-2 px-3 py-1">
                  <span className={`font-mono ${c.pk ? 'font-bold' : ''}`}>{c.name}</span>
                  <span className="text-slate-400">{c.type}</span>
                  {c.pk && <span className="chip ml-auto bg-amber-100 !px-1.5 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-300">PK</span>}
                  {c.fk && <span className="chip ml-auto bg-sky-100 !px-1.5 text-[10px] text-sky-800 dark:bg-sky-950 dark:text-sky-300">FK → {c.fk}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SqlSchemaWidget() {
  const [db, setDb] = useState('shop');
  return (
    <div>
      <div className="mb-3 flex gap-2">
        {DATABASES.map((d) => <button key={d.id} className={db === d.id ? 'btn-primary !py-1' : 'btn-secondary !py-1'} onClick={() => setDb(d.id)}>{d.title}</button>)}
      </div>
      <p className="mb-3 text-sm text-slate-500">{DATABASES.find((d) => d.id === db)?.description} <b>PK</b> = primary key (unique row id). <b>FK</b> = foreign key (points to a row in another table).</p>
      <SqlSchema db={db} />
    </div>
  );
}
