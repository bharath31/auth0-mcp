import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['modelcontextprotocol/index.ts', 'example.ts'],
  format: ['cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node20',
  platform: 'node'
});
