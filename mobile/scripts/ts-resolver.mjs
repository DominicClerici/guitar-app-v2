// Lets Node run the app's TypeScript sources directly. The codebase writes
// extensionless imports ('./catalog', '../theory') because Metro resolves them;
// Node's ESM resolver does not, so this fills in the '.ts' or '/index.ts'.
//
// Used by scripts/verify-chord-library.ts. Only touches relative specifiers.

import { statSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL) {
      const target = fileURLToPath(new URL(specifier, context.parentURL));
      // A bare directory specifier resolves to its index, which is why this
      // checks for a file rather than mere existence.
      if (!isFile(target)) {
        for (const candidate of [`${target}.ts`, `${target}/index.ts`]) {
          if (isFile(candidate)) {
            return nextResolve(pathToFileURL(candidate).href, context);
          }
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
