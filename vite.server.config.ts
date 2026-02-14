import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'cjs' ? 'server.cjs' : 'server.js'),
    },
    rollupOptions: {
      external: [/^node:/],
      output: {
        exports: 'named',
      },
    },
    minify: false,
    sourcemap: true,
    target: 'node18',
  },
});
