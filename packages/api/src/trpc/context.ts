import { createDb, type Db } from '@guitar/db';

import { type Auth, type AuthSession, createAuth } from '../auth';
import type { Env } from '../env';

export interface Context {
  env: Env;
  req: Request;
  /** Lazy so procedures that never touch Postgres don't construct a client or need DATABASE_URL. */
  readonly db: Db;
  readonly auth: Auth;
  /**
   * Memoised per request: public procedures never pay for a session lookup, and a batched request
   * that hits several protected procedures pays for one rather than one each.
   */
  getSession(): Promise<AuthSession>;
}

export function createContext({ env, req }: { env: Env; req: Request }): Context {
  let db: Db | undefined;
  let auth: Auth | undefined;
  let session: Promise<AuthSession> | undefined;

  const context: Context = {
    env,
    req,
    get db() {
      db ??= createDb(env.DATABASE_URL);
      return db;
    },
    get auth() {
      auth ??= createAuth({ env, db: context.db });
      return auth;
    },
    getSession() {
      session ??= context.auth.api.getSession({ headers: req.headers });
      return session;
    },
  };

  return context;
}
