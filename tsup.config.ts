import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['modelcontextprotocol/index.ts', 'example.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node20',
  platform: 'node',
  minify: true,
  splitting: true,
  treeshake: true,
});
