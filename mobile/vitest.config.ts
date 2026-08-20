import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Vitest covers the pure modules — the ones that are plain string and number math
// with no React and no native modules. Anything that imports react-native belongs
// in the app, not here.
//
// Most of them live under src/lib, but a feature can own decidable logic that no
// other feature would ever import: the rhythm drill's grid, grading and microphone
// calibration are arithmetic over numbers a device collected, and they are the only
// place its correctness can be pinned down, since neither audio nor a microphone can
// be exercised in a test run.
//
// A component can own one for the same reason — the pager's repaint order is which
// pages to bring to a new palette and when, which is arithmetic over indices and is
// answerable without a device.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: [
      'src/lib/**/*.test.ts',
      'src/features/**/*.test.ts',
      'src/components/**/*.test.ts',
    ],
  },
});
