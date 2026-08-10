/**
 * Type-only entrypoint (BACKEND_PLAN.md §4). This is what `@guitar/api` resolves to, so a client
 * doing `import type { AppRouter } from '@guitar/api'` is erased entirely at compile time and no
 * server code can reach the React Native or browser bundle. The Worker itself is `@guitar/api/worker`.
 */
export type { AppRouter } from './trpc/router';
