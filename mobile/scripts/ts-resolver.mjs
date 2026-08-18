// Lets Node run the app's TypeScript sources directly. The codebase writes
// extensionless imports ('./catalog', '../theory') because Metro resolves them;
// Node's ESM resolver does not, so this fills in the '.ts' or '/index.ts'.
//
// It also resolves the '@/' alias to src/, the way tsconfig's paths do. A pure
// module reached by one of these scripts is free to write either form, and
// mixing them is normal — '@/lib/accidentals' is one import away from a module
// that spells the same directory '../accidentals'.
//
// Used by scripts/verify-chord-library.ts and scripts/verify-guitar-voicings.ts.

import { statSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = new URL('../src/', import.meta.url);

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    const aliased = specifier.startsWith('@/');
    const base = aliased ? SRC : context.parentURL;

    if ((aliased || specifier.startsWith('.')) && base) {
      const target = fileURLToPath(new URL(aliased ? specifier.slice(2) : specifier, base));
      // A bare directory specifier resolves to its index, which is why this
      // checks for a file rather than mere existence.
      for (const candidate of [target, `${target}.ts`, `${target}/index.ts`]) {
        if (isFile(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
