// Production server: serves the built app from dist/ and the tutor API.
// Run with: npm run build && npm start   (reads .env if present)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { handleApi } from './api.ts';

const DIST = resolve(import.meta.dirname, '..', 'dist');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.csv': 'text/csv; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

async function serveFile(path: string, res: import('node:http').ServerResponse) {
  const data = await readFile(path);
  const immutable = path.includes(`${join('dist', 'assets')}`);
  res.writeHead(200, {
    'Content-Type': TYPES[extname(path)] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(data);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res);

    // Resolve inside dist/ only (prevents path traversal).
    const candidate = normalize(join(DIST, decodeURIComponent(url.pathname)));
    if (candidate.startsWith(DIST)) {
      const s = await stat(candidate).catch(() => null);
      if (s?.isFile()) return await serveFile(candidate, res);
    }
    // SPA fallback: unknown routes render the app.
    return await serveFile(join(DIST, 'index.html'), res);
  } catch (e) {
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error. Did you run "npm run build" first?');
  }
}).listen(PORT, HOST, () => {
  console.log(`DataScience Academy running at http://${HOST}:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'AI tutor: enabled' : 'AI tutor: disabled (set ANTHROPIC_API_KEY in .env)');
});
