import { defineConfig } from 'vite';
import { resolve } from 'path';

const pkgRoot = resolve(__dirname);
const demoRoot = resolve(__dirname, 'demo');

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
  build: {
    outDir: resolve(pkgRoot, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PureDocs',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'umd' ? 'puredocs.umd.cjs' : 'puredocs.js'),
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
