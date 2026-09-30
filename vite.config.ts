import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'node:fs';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins:
    mode === 'ios'
      ? [
          {
            name: 'offline-favicon',
            transformIndexHtml: {
              order: 'pre' as const,
              handler: (html: string) =>
                html.replace(
                  'href="/src/favicon.svg"',
                  `href="data:image/svg+xml;base64,${readFileSync(new URL('./src/favicon.svg', import.meta.url)).toString('base64')}"`,
                ),
            },
          },
          viteSingleFile(),
        ]
      : [],
  build: {
    target: 'es2020',
    outDir: mode === 'ios' ? 'dist-ios' : 'dist',
    assetsInlineLimit: mode === 'ios' ? 10000000 : 0,
  },
}));
