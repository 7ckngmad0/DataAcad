// Browser smoke test: drives the real app in headless Chrome/Edge.
// Usage: start the app (npm run dev), then: node scripts/smoke.mjs [baseUrl]
import { chromium } from 'playwright-core';
const base = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const ok = (c, msg) => { console.log((c ? '✓ ' : '✗ ') + msg); if (!c) process.exitCode = 1; };

await page.goto(base + '/courses/intro/what-is-data-science');
await page.waitForSelector('text=Learning objectives');
ok(true, 'lesson page renders');
// Run first code example
await page.locator('button:has-text("Run")').first().click();
await page.waitForSelector('pre:has-text("Rows and columns: (1500, 10)")', { timeout: 180000 });
ok(true, 'Python example runs (pandas)');
await page.waitForSelector('table.df', { timeout: 30000 });
ok(true, 'DataFrame HTML displayed');
// Exercise check
const ex = page.locator('.card:has-text("Run your first line of Python")');
await ex.locator('.cm-content').click(); await page.keyboard.press('Control+End');
await page.keyboard.type('print("Hello, Data Science!")');
await ex.locator('button:has-text("Check answer")').click();
await ex.locator('text=Correct!').waitFor({ timeout: 60000 });
ok(true, 'exercise check passes and records progress');
// Quiz
const quiz = page.locator('#quiz');
const qs = await quiz.locator('.card').count();
for (let i = 0; i < qs; i++) {
  const card = quiz.locator('.card').nth(i);
  const opt = card.locator('button').first();
  if (await card.locator('input').count()) await card.locator('input').fill('exploratory data analysis');
  else await opt.click();
}
await quiz.locator('button:has-text("Submit answers")').click();
await quiz.locator('text=Retake quiz').waitFor();
ok(true, 'quiz submits and shows score');
await page.locator('button:has-text("Mark lesson as complete")').click();
await page.waitForSelector('text=Completed — mark as not done');
ok(true, 'lesson marked complete');
await page.reload();
await page.waitForSelector('text=Completed — mark as not done');
ok(true, 'progress persists after reload');
await page.goto(base + '/');
await page.waitForSelector('text=Lessons completed');
ok((await page.content()).includes('1/'), 'dashboard shows progress');
for (const p of ['/roadmap', '/courses', '/practice', '/playground?tab=sql', '/projects', '/tutor', '/progress', '/settings']) {
  await page.goto(base + p);
  await page.waitForLoadState('networkidle');
  ok((await page.locator('h1').count()) > 0, `page ${p} renders`);
}
await page.goto(base + '/playground?tab=sql');
await page.locator('button:has-text("Run")').first().click();
await page.waitForSelector('table.df');
ok(true, 'SQL playground runs a query');
// Bookmark + notes, then find the note through search
await page.goto(base + '/courses/stats/stats-descriptive');
await page.locator('button:has-text("Bookmark")').click();
await page.waitForSelector('button:has-text("Bookmarked")');
await page.locator('textarea[aria-label="My notes for this lesson"]').fill('median resists outliers zebra');
await page.waitForSelector('text=Saved ·');
ok(true, 'bookmark and note saved');
await page.goto(base + '/notes');
await page.waitForSelector('text=median resists outliers zebra');
ok((await page.locator('a:has-text("Measures of Centre")').count()) > 0, 'notes page lists bookmark and note');
await page.keyboard.press('Control+k');
await page.locator('[role=dialog] input').fill('zebra');
await page.waitForSelector('[role=option]:has-text("Your note")');
await page.locator('[role=dialog] input').fill('confusion matrix');
await page.waitForSelector('[role=option]');
await page.keyboard.press('Enter');
await page.waitForURL(/\/courses\//);
ok(!(await page.locator('[role=dialog]').count()), 'search opens with Ctrl+K and navigates on Enter');
console.log(errors.length ? 'Browser errors:\n' + errors.join('\n') : 'No browser errors');
await browser.close();
