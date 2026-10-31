import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleApi } from './server/api.ts';

export default defineConfig(({ mode }) => {
  // Server-only secrets: copied into process.env for the API middleware, never exposed
  // to the browser (Vite only exposes variables prefixed with VITE_).
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['ANTHROPIC_API_KEY', 'TUTOR_MODEL', 'TUTOR_EFFORT']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  const apiPlugin = {
    name: 'tutor-api',
    configureServer(server: { middlewares: { use: (fn: any) => void } }) {
      server.middlewares.use((req: any, res: any, next: () => void) =>
        req.url?.startsWith('/api/') ? handleApi(req, res) : next(),
      );
    },
    configurePreviewServer(server: { middlewares: { use: (fn: any) => void } }) {
      server.middlewares.use((req: any, res: any, next: () => void) =>
        req.url?.startsWith('/api/') ? handleApi(req, res) : next(),
      );
    },
  };
  return {
    plugins: [react(), tailwindcss(), apiPlugin],
    server: { host: '127.0.0.1', port: 5173 },
    build: { chunkSizeWarningLimit: 2500 },
  };
});
