// Checks every lesson resource URL and reports dead or redirected-away links.
//   node scripts/check-links.ts
import { MODULES } from '../src/content/index.ts';

const refs = new Map<string, string[]>();
const add = (url: string, where: string) => refs.set(url, [...(refs.get(url) ?? []), where]);
for (const m of MODULES) for (const l of m.lessons) for (const r of l.resources) add(r.url, l.id);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
async function status(url: string): Promise<string | null> {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) });
      res.body?.cancel();
      if (res.ok) return null;
      // Sites that block bots (403/429) are reported separately; they usually work in a browser.
      if (method === 'GET') return `HTTP ${res.status}`;
    } catch (e) {
      if (method === 'GET') return (e as Error).cause ? String((e as { cause: Error }).cause.message ?? (e as Error).cause) : (e as Error).message;
    }
  }
  return null;
}

const urls = [...refs.keys()];
const bad: [string, string][] = [];
for (let i = 0; i < urls.length; i += 8) {
  const batch = urls.slice(i, i + 8);
  const results = await Promise.all(batch.map(status));
  batch.forEach((u, j) => results[j] && bad.push([u, results[j]!]));
}
console.log(`Checked ${urls.length} unique links`);
for (const [u, why] of bad) console.log(`${why.padEnd(10)} ${u}  (${refs.get(u)!.join(', ')})`);
console.log(bad.length ? `✗ ${bad.length} link(s) need attention` : '✓ All links OK');
