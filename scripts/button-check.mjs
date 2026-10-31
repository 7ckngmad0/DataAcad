// Clicks every visible, enabled button on the main pages and reports buttons that throw errors
// or have no observable effect (no DOM change, navigation, download or dialog).
// Start the dev server first, then: node scripts/button-check.mjs [baseUrl]
import { chromium } from 'playwright-core';
const base = process.argv[2] || 'http://127.0.0.1:5173';
const pages = [
  '/', '/roadmap', '/courses', '/courses/stats', '/courses/stats/stats-spread', '/courses/stats/checkpoint',
  '/practice', '/practice?tab=all', '/practice?tab=review', '/playground', '/playground?tab=notebook', '/playground?tab=sql', '/playground?tab=datasets',
  '/projects', '/projects/student-grades', '/tutor', '/progress', '/settings', '/notes',
];
// Buttons whose effect is deliberately external or destructive.
const SKIP = /reset all progress|delete|import progress/i;

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
let where = '';
page.on('pageerror', (e) => problems.push(`${where}: page error ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`${where}: console ${m.text().slice(0, 160)}`));
page.on('dialog', (d) => d.dismiss());
let effect = false;
page.on('download', () => (effect = true));
page.on('dialog', () => (effect = true));

const snapshot = () =>
  page.evaluate(() => {
    const s = document.body.innerHTML + location.href;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
    return h;
  });
let clicked = 0;
for (const p of pages) {
  await page.goto(base + p);
  await page.waitForSelector('h1', { timeout: 20000 });
  await page.waitForTimeout(300);
  const count = await page.locator('main button:visible').count();
  for (let i = 0; i < count; i++) {
    const btns = page.locator('main button:visible');
    if (i >= (await btns.count())) break;
    const b = btns.nth(i);
    const label = ((await b.innerText().catch(() => '')) || (await b.getAttribute('aria-label')) || (await b.getAttribute('title')) || '?').trim().replace(/\s+/g, ' ').slice(0, 40);
    // Already-selected tabs/modes (aria-pressed) legitimately change nothing when clicked again.
    if (SKIP.test(label) || !(await b.isEnabled().catch(() => false)) || (await b.getAttribute('aria-pressed')) === 'true') continue;
    where = `${p} [${label}]`;
    effect = false;
    const before = await snapshot();
    await b.click({ timeout: 3000 }).catch((e) => {
      const why = e.message.split('\n').find((l) => /intercepts|not stable|not visible|detached|outside/.test(l)) ?? e.message.split('\n')[0];
      problems.push(`${where}: could not click (${why.trim().slice(0, 160)})`);
    });
    clicked++;
    await page.waitForTimeout(250);
    const after = await snapshot().catch(() => 'navigated');
    if (before === after && !effect) problems.push(`${where}: no visible effect`);
    if (!page.url().startsWith(base + p.split('?')[0]) || page.url() !== base + p) {
      await page.goto(base + p);
      await page.waitForSelector('h1');
    }
  }
}
console.log(`Clicked ${clicked} buttons on ${pages.length} pages`);
problems.forEach((x) => console.log('PROBLEM', x));
console.log(problems.length ? `✗ ${problems.length} problem(s)` : '✓ Every button did something and no errors were logged');
await browser.close();
