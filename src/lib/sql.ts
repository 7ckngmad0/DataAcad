// Real SQLite in the browser (sql.js / WebAssembly).
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { getDb } from '../content/databases';

let SQL: Promise<SqlJsStatic> | null = null;
const loadSql = () => (SQL ??= initSqlJs({ locateFile: () => wasmUrl }));

export async function openDb(id: string): Promise<Database> {
  const S = await loadSql();
  const db = new S.Database();
  db.exec(getDb(id).sql);
  return db;
}

export interface SqlResult {
  columns: string[];
  values: unknown[][];
}

export function runSql(db: Database, query: string): { results: SqlResult[]; error?: string; changes: number } {
  try {
    const results = db.exec(query).map((r) => ({ columns: r.columns, values: r.values }));
    return { results, changes: db.getRowsModified() };
  } catch (e) {
    return { results: [], error: (e as Error).message, changes: 0 };
  }
}

function norm(v: unknown) {
  if (typeof v === 'number') return Math.round(v * 100) / 100;
  if (typeof v === 'string') return v.trim();
  return v;
}

/**
 * Compares the learner's result with the solution's. Row order only matters when the
 * solution uses ORDER BY. Column names are ignored (aliases may differ); values must match.
 */
export async function checkSql(dbId: string, learner: string, solution: string): Promise<string | null> {
  const [a, b] = await Promise.all([openDb(dbId), openDb(dbId)]);
  try {
    const mine = runSql(a, learner);
    if (mine.error) return `SQL error: ${mine.error}`;
    const ref = runSql(b, solution);
    const m = mine.results.at(-1);
    const r = ref.results.at(-1);
    if (!r) return null;
    if (!m) return 'Your query returned no result set. Did you write a SELECT?';
    if (m.columns.length !== r.columns.length)
      return `Expected ${r.columns.length} column(s) (${r.columns.join(', ')}), but your query returned ${m.columns.length}.`;
    if (m.values.length !== r.values.length) return `Expected ${r.values.length} row(s), but your query returned ${m.values.length}.`;
    const key = (row: unknown[]) => JSON.stringify(row.map(norm));
    let mineRows = m.values.map(key);
    let refRows = r.values.map(key);
    const ordered = /order\s+by/i.test(solution);
    if (!ordered) {
      mineRows = [...mineRows].sort();
      refRows = [...refRows].sort();
    }
    for (let i = 0; i < refRows.length; i++) {
      if (mineRows[i] !== refRows[i])
        return ordered
          ? `Row ${i + 1} differs from the expected result. Check your filters, calculations and ORDER BY.`
          : 'Some rows differ from the expected result. Check your filters and calculations.';
    }
    return null;
  } finally {
    a.close();
    b.close();
  }
}
