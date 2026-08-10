/**
 * Worker bindings.
 *
 * Cloudflare types are imported explicitly rather than taken from the ambient globals that
 * `@cloudflare/workers-types` installs. `AppRouter` reaches this file through the context type, and
 * the Expo/Next TypeScript programs that import `AppRouter` do not load those globals — an explicit
 * import resolves through this package's own node_modules from any consumer.
 */
import type { KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  /** Neon connection string for this environment's branch. */
  DATABASE_URL: string;

  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;

  /** Comma-separated origins allowed for CORS and Better Auth redirects. */
  TRUSTED_ORIGINS: string;

  APPLE_CLIENT_ID?: string;
  APPLE_APP_BUNDLE_IDENTIFIER?: string;
  APPLE_CLIENT_SECRET?: string;

  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;

  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;

  /**
   * Better Auth's anonymous plugin (BACKEND_PLAN.md §5), on unless this is exactly `'false'`. It
   * is set in wrangler.jsonc rather than being a secret, and exists as a kill switch: turning it
   * off stops new guest accounts being created without a deploy of the app, and the guest rows
   * already in the database keep working because `is_anonymous` is part of the schema either way.
   */
  ENABLE_ANONYMOUS_AUTH?: string;

  /** Better Auth `secondaryStorage`. Optional until the namespace is created. */
  SESSION_KV?: KVNamespace;
}

export function trustedOrigins(env: Pick<Env, 'TRUSTED_ORIGINS'>): string[] {
  return (env.TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
