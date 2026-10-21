import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { "@ui": new URL("../../packages/ui", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") } }, root: path.resolve(import.meta.dirname), build: { outDir: 'dist', emptyOutDir: true } });
