// Renders every lesson and project page in headless Chrome and reports display problems.
// Start the dev server first (npm run dev), then: node scripts/render-check.ts [baseUrl]
import { chromium } from 'playwright-core';
import { MODULES, PROJECTS } from '../src/content/index.ts';

const base = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const problems: string[] = [];
let current = '';
page.on('pageerror', (e) => problems.push(`${current}: page error ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('Download the React DevTools')) problems.push(`${current}: console ${m.text().slice(0, 200)}`);
});

const paths = [
  ...MODULES.flatMap((m) => [`/courses/${m.id}`, ...m.lessons.map((l) => `/courses/${m.id}/${l.id}`), `/courses/${m.id}/checkpoint`]),
  ...PROJECTS.map((p) => `/projects/${p.id}`),
];

for (const p of paths) {
  current = p;
  await page.goto(base + p);
  await page.waitForSelector('h1', { timeout: 20000 });
  const report = await page.evaluate(() => {
    const main = document.querySelector('main')!;
    const text = main.innerText;
    // Text outside code editors and <pre>/<code> elements (where literal symbols are legitimate).
    const clone = main.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('pre, code, .cm-editor, .katex').forEach((n) => n.remove());
    const prose = clone.innerText;
    return {
      katexErrors: main.querySelectorAll('.katex-error').length,
      escapedBackticks: (text.match(/\\`/g) || []).length,
      placeholderSteps: Array.from(main.querySelectorAll('ol li, .divide-y > div')).filter((li) => (li as HTMLElement).innerText.trim().replace(/^\d+\s*/, '') === '…').length,
      strayDollars: (prose.match(/\$[^\s$]+\$/g) || []).length,
      notFound: text.includes('not found'),
    };
  });
  const issues = Object.entries(report).filter(([, v]) => v);
  if (issues.length) problems.push(`${p}: ${issues.map(([k, v]) => `${k}=${v}`).join(', ')}`);
}

console.log(`Checked ${paths.length} pages`);
problems.forEach((x) => console.log('PROBLEM', x));
console.log(problems.length ? `✗ ${problems.length} problem(s)` : '✓ No rendering problems found');
await browser.close();
process.exit(problems.length ? 1 : 0);
