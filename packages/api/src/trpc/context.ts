import { createDb, type Db } from '@guitar/db';

import type { Env } from '../env';

export interface Context {
  env: Env;
  req: Request;
  /** Lazy so procedures that never touch Postgres don't construct a client or need DATABASE_URL. */
  readonly db: Db;
}

export function createContext({ env, req }: { env: Env; req: Request }): Context {
  let db: Db | undefined;

  return {
    env,
    req,
    get db() {
      db ??= createDb(env.DATABASE_URL);
      return db;
    },
  };
}
