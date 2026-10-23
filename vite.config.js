import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  plugins: [{
    name: 'story-script-download',
    configureServer(server) {
      server.middlewares.use('/story-script.md', (_req, res) => {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.end(readFileSync(resolve('docs/story-script.md'), 'utf-8'));
      });
    },
    generateBundle() {
      for (const fileName of ['favicon.svg', 'assets/museum.webp', 'assets/yiwu.webp']) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(resolve('public', fileName)) });
      }
      this.emitFile({ type: 'asset', fileName: 'story-script.md', source: readFileSync(resolve('docs/story-script.md'), 'utf-8') });
    },
  }],
  build: {
    copyPublicDir: false,
    rollupOptions: {
      input: { main: resolve('index.html'), story: resolve('story.html') },
      output: { manualChunks: { three: ['three'] } },
    },
  },
});
