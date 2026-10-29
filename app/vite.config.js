import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = ['atoms', 'molecules', 'sections', 'layouts', 'tokens/themes', 'foundation', 'lib'];

// Re-runs tools/build.js whenever a component, theme or lib file changes,
// so catalog/index.json and integrations/react stay in sync while you work.
const catalogSync = () => ({
  name: 'catalog-sync',
  buildStart() { execFileSync('node', ['tools/build.js'], { cwd: root, stdio: 'inherit' }); },
  configureServer(server) {
    const isSource = (f) => SOURCES.some((s) => path.relative(root, f).startsWith(s + path.sep)) && !f.includes(`${path.sep}dist${path.sep}`);
    server.watcher.add(SOURCES.map((s) => path.join(root, s)));
    const run = (f) => {
      if (!isSource(f)) return;
      try { execFileSync('node', ['tools/build.js'], { cwd: root, stdio: 'inherit' }); }
      catch { server.config.logger.error('catalog-sync: build failed, see errors above'); }
    };
    ['add', 'change', 'unlink'].forEach((e) => server.watcher.on(e, run));
  }
});

export default defineConfig({
  root: path.join(root, 'app'),
  base: './',
  plugins: [react(), catalogSync()],
  server: { fs: { allow: [root] } },
  build: { outDir: path.join(root, 'app/dist'), emptyOutDir: true }
});
