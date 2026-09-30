import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'ios' ? [viteSingleFile()] : [],
  build: { target: 'es2020', outDir: mode === 'ios' ? 'dist-ios' : 'dist', assetsInlineLimit: mode === 'ios' ? 10000000 : 0 },
}));
