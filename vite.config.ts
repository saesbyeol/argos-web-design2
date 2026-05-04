import { defineConfig, type Plugin } from 'vite';
import { resolve, dirname, isAbsolute } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INCLUDE_RE = /<!--\s*@include\s+"([^"]+)"\s*-->/g;
const MAX_DEPTH = 5;

function htmlInclude(): Plugin {
  const baseDir = __dirname;

  function resolveAndInline(html: string, depth: number): string {
    if (depth > MAX_DEPTH) {
      throw new Error(`@include exceeded max depth of ${MAX_DEPTH}`);
    }
    return html.replace(INCLUDE_RE, (_match, relPath: string) => {
      if (relPath.includes('..') || isAbsolute(relPath)) {
        throw new Error(`@include path must be repo-relative without "..": ${relPath}`);
      }
      const target = resolve(baseDir, relPath);
      if (!target.startsWith(baseDir)) {
        throw new Error(`@include path escapes project root: ${relPath}`);
      }
      const partial = readFileSync(target, 'utf8');
      return resolveAndInline(partial, depth + 1);
    });
  }

  return {
    name: 'html-include',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return resolveAndInline(html, 0);
      },
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [htmlInclude()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        divizije: resolve(__dirname, 'divizije.html'),
        nekretnine: resolve(__dirname, 'nekretnine.html'),
        horeca: resolve(__dirname, 'horeca.html'),
        investicije: resolve(__dirname, 'investicije.html'),
        impex: resolve(__dirname, 'impex.html'),
        kontakt: resolve(__dirname, 'kontakt.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
