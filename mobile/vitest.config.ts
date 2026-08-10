import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Vitest covers the pure theory modules under src/lib only — the ones that are
// plain string and number math with no React and no native modules. Anything that
// imports react-native belongs in the app, not here.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/lib/**/*.test.ts'],
  },
});
