/**
 * The preference set as the rest of the app reads it, published from one place.
 *
 * `usePreferences` ran its own live query while the settings screen was its only reader. Now that
 * a preference decides how a note is spelled — on the tuner, the neck, the detector, the drone —
 * a query per consumer would mean a dozen SQLite subscriptions all re-running on the same write.
 * So `PreferencesProvider` runs it once and publishes here, and every hook is a read of this.
 *
 * A module store rather than a context, because that is what lets a hook subscribe to one key:
 * `useSyncExternalStore` re-renders only when the value it returns actually changes, so a fretboard
 * that asked how to spell a note sits still while the theme is being changed. A context would wake
 * every consumer for every preference.
 */
import { DEFAULT_PREFERENCES, type Preferences } from '@guitar/shared';

const listeners = new Set<() => void>();

let current: Preferences = DEFAULT_PREFERENCES;

function same(a: Preferences, b: Preferences): boolean {
  return (Object.keys(a) as (keyof Preferences)[]).every((key) => a[key] === b[key]);
}

/**
 * Replaces the published set, if it says anything new.
 *
 * The guard is what keeps the key selectors honest: the provider re-folds whenever its query
 * answers, which a sync pull does on every run whether or not a preference moved, and republishing
 * an equal set would push a new snapshot object past every subscriber for nothing.
 */
export function publishPreferences(next: Preferences): void {
  if (same(current, next)) return;

  current = next;
  for (const listener of listeners) listener();
}

/** The preferences in force. `DEFAULT_PREFERENCES` until the provider's first read answers. */
export function readPreferences(): Preferences {
  return current;
}

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
