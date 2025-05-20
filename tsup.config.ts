import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  legacyOutput: true,
  globalName: 'Heapchat',
  outDir: 'dist',
});
