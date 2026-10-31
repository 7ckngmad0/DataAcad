# DataScience Academy

An interactive course that takes you from zero to job-ready in data science. Python, pandas, scikit-learn and SQL all run in your browser, so there is nothing to install to learn.

- **12 modules, 81 lessons**: intro, Python, math, statistics, libraries, cleaning/EDA, visualization, SQL, BI, machine learning, advanced topics, portfolio.
- **Lesson layout**: every lesson follows the same 14-part structure (objectives → simple and technical explanations → key terms → worked code with a line-by-line explanation → common mistakes → exercises → quiz → summary → resources).
- **Practice**: 247 auto-checked exercises (write, debug, fill-in, predict-the-output, dataset analysis) and 429 quiz questions. Each module ends with a checkpoint.
- **Interactive widgets**: 22 of them, covering gradient descent, the CLT, Bayes, k-means, overfitting and more.
- **Playground**: a Python scratchpad, a notebook mode, a SQL console and 9 practice datasets.
- **Projects**: 11 guided portfolio projects, each with a downloadable report.
- **Search, notes and bookmarks**: Ctrl+K (or `/`) searches lessons, key terms, exercises, projects and your own notes. Every lesson has a "My notes" box and a bookmark button, and the Notes & Bookmarks page collects them and exports your notes as Markdown.
- **Gamification**: XP, streaks, badges, a weekly challenge and a progress dashboard.
- **AI tutor**: powered by Claude. Your API key stays on the server.

## Requirements

- Node.js 24 or later (the server is TypeScript run directly by Node).
- Internet access the first time you run Python code, because Pyodide (about 10 MB) loads from the jsDelivr CDN.
- Optional: an Anthropic API key for the tutor. Everything else works without one.

## Getting started

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

Production:

```bash
npm run build
npm start            # http://127.0.0.1:8787 (set PORT to change)
```

### Enabling the AI tutor

```bash
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...
```

Both `npm run dev` and `npm start` read `.env` on the server side only. The browser talks to `/api/tutor`, never to Anthropic directly, and the key is never bundled into frontend code. Settings → AI tutor shows whether the key was picked up. Optional overrides: `TUTOR_MODEL` (default `claude-opus-5-5`), `TUTOR_EFFORT` (default `medium`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with the tutor API mounted as middleware |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm start` | Serve `dist/` plus the tutor API |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests (vitest) for XP, streaks, badges, notes/bookmarks, import sanitizing, search and the weekly challenge |
| `npm run validate` | Content QA: structure checks plus running every code example, exercise solution and project step in Pyodide/sql.js. Also confirms every starter *fails* its tests. Code examples marked `expectsError` must raise. Pass a module id to check one module, e.g. `npm run validate ml` |
| `npm run datasets` | Regenerate the synthetic CSVs in `public/datasets/` (Python with numpy and pandas) |
| `node scripts/smoke.mjs [url]` | Browser smoke test (needs a running app and Chrome installed) |
| `node scripts/render-check.ts [url]` | Opens every lesson, checkpoint and project page and reports rendering problems (broken math, stray `$`, console errors) |
| `node scripts/button-check.mjs [url]` | Clicks every button on the main pages and reports buttons that error or do nothing |
| `node scripts/check-links.ts` | Checks every lesson resource link (some sites, e.g. hdsr.mitpress.mit.edu, block bots with 403 but work in a browser) |
| `node scripts/check-explanations.ts` | Lists code examples whose explanation doesn't line up line-by-line with the code |

## How it's built

```
src/
  content/      course content as TypeScript (m01-intro.ts … m12-portfolio.ts, projects.ts, databases.ts)
  pages/        one component per route (lazy-loaded)
  components/   CodeRunner, ExerciseCard, Quiz, Markdown, widgets/…
  lib/          progress (localStorage), gamification, python (worker client), sql
  workers/      python.worker.ts (Pyodide)
server/
  api.ts        /api/tutor (streaming Claude responses, rate limited) and /api/tutor/status
  server.ts     static file server with SPA fallback
scripts/        validation and QA tools
public/datasets synthetic, seeded CSVs
```

- **Python** runs in a Web Worker with Pyodide 0.29 (Python 3.13, numpy, pandas, scikit-learn, matplotlib, seaborn). The datasets are preloaded at `data/<name>.csv`, matplotlib figures are captured as images, `input()` reads from a stdin box, and Stop restarts the worker. Runs time out after 60 s.
- **SQL** runs in the browser with sql.js against two generated databases, `shop` and `company`. SQL exercises are checked by comparing result sets. Row order counts only when the reference solution uses `ORDER BY`. Lesson examples and exercises start from a fresh database on every run; the SQL Playground keeps your changes until you reset it.
- **Progress** is stored in `localStorage` (`dsa-progress-v1`). Use Settings → Export/Import to back it up or move it to another browser.
- **Content** is written in Markdown with KaTeX math inside the `md` template tag. Write `\$` for a literal dollar sign.

## Known limitations

- Progress lives in one browser. There are no accounts or sync; use export/import instead.
- The first Python run needs the network to download Pyodide.
- TensorFlow/PyTorch, Spark and similar libraries can't run in the browser, so the lessons that cover them show read-only code.
- The datasets are synthetic, generated to teach specific lessons (e.g. `messy_customers.csv` is deliberately dirty). They are not real-world data.
- The tutor needs your own Anthropic API key and is rate limited to 20 requests per minute per client.
