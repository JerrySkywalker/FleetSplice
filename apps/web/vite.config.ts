import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  build: { outDir: '../../dist/web', emptyOutDir: true },
  // G05 serves only the built assets from the authenticated loopback Hub.
});
