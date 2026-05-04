import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    cssMinify: true,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
