import { defineConfig } from 'vite';
import { resolve } from 'path';

const pkgRoot = resolve(__dirname);
const demoRoot = resolve(__dirname, 'apps/demo');

/** Plugin: full reload when any package file changes */
function watchAllReload() {
  return {
    name: 'puredocs-watch-all',
    configureServer(server: { watcher: { add: (p: string | string[]) => void }; ws: { send: (msg: { type: string; path?: string }) => void } }) {
      server.watcher.add([resolve(pkgRoot, 'src'), demoRoot]);
      server.watcher.on('change', () => {
        server.ws.send({ type: 'full-reload', path: '*' });
      });
    },
  };
}

export default defineConfig({
  root: demoRoot,
  plugins: [watchAllReload()],
  server: {
    middlewareMode: false,
  },
  appType: 'spa',
  build: {
    outDir: resolve(pkgRoot, 'dist'),
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PureDocs',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'umd') return 'puredocs.umd.js';
        if (format === 'cjs') return 'puredocs.cjs';
        return 'puredocs.js';
      },
    },
    rollupOptions: {
      output: {
        exports: 'named',
        inlineDynamicImports: true,
      },
    },
    minify: 'esbuild',
    sourcemap: true,
    target: 'es2020',
    cssMinify: true,
  },
  css: {
    devSourcemap: true,
  },
});
