import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { "@ui": new URL("../../packages/ui", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") } },
  root: fileURLToPath(new URL('.', import.meta.url)),
  build: { outDir: '../../dist/web', emptyOutDir: true },
  // G05 serves only the built assets from the authenticated loopback Hub.
});
