import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './scripts'),
    },
  },
});
