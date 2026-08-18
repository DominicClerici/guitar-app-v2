/**
 * Reading preferences (BACKEND_PLAN.md §6).
 *
 * The table is queried once, by `PreferencesProvider`; these hooks read what it published. That
 * keeps a value pulled from another device appearing on screen without anything invalidating a
 * cache, and costs one subscription rather than one per reader. Reads never suspend and never
 * fail: before the first query answers — and after one that answers with nothing — what comes
 * back is `DEFAULT_PREFERENCES`.
 *
 * Read the narrowest hook that answers the question. `usePreferences` wakes its caller for any
 * preference; the ones below wake it only for theirs.
 */
import type { PreferenceEntry, PreferenceKey, Preferences } from '@guitar/shared';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { accidentalSide, type AccidentalSide } from '@/lib/accidentals';
import { useSession } from '@/lib/auth';
import { tuningFor, type Tuning } from '@/lib/tuning';

import { readPreferences, subscribePreferences } from './snapshot';
import { resetPreference, setPreference } from './store';

/** No account owns this, so the writers refuse before a session exists. */
const NOBODY = '';

/** The whole preference set. For a screen that shows all of them — the settings card. */
export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribePreferences, readPreferences, readPreferences);
}

/**
 * One preference, and only that one.
 *
 * `useSyncExternalStore` compares what the selector returns, and every preference is a string, so
 * a caller asking for `accidentalPreference` is not re-rendered by a change of theme.
 */
export function usePreference<K extends PreferenceKey>(key: K): Preferences[K] {
  const read = useCallback(() => readPreferences()[key], [key]);

  return useSyncExternalStore(subscribePreferences, read, read);
}

/**
 * Which way to spell a black key here, from what the user chose.
 *
 * `fallback` is what `auto` means on this surface — the spelling it would have used had there been
 * no setting at all, which is not the same everywhere: a tuning falls to flats and a chromatic
 * drill to sharps. State it at the call site, because the call site is the only thing that knows.
 *
 * This is for the places where the choice is genuinely open. Where the music has already answered
 * — a key signature, a scale's letters, a chord's own root — the answer comes from the engine that
 * knows it (`accidentalSideFor`, `spellScale`, the chord engine's accidental count) and this is at
 * most the tie-break handed to it.
 */
export function useAccidentalSide(fallback: AccidentalSide): AccidentalSide {
  return accidentalSide(usePreference('accidentalPreference'), fallback);
}

/**
 * The tuning in force, as a neck rather than as six comma-separated numbers.
 *
 * `tuningFor` memoises on the stored string, so this returns the *same* object until the user
 * actually moves a string — which is the whole reason it is safe to hand to a `useMemo` dependency
 * list or to compare with `===`. A hook that parsed on every read would hand back a new array each
 * time and quietly invalidate every table derived from it, on every unrelated preference write.
 */
export function useTuning(): Tuning {
  return useSyncExternalStore(subscribePreferences, readTuning, readTuning);
}

function readTuning(): Tuning {
  return tuningFor(readPreferences().tuning);
}

/**
 * Whether motion should be reduced here.
 *
 * A boolean rather than the stored `'on' | 'off'`, because every caller is a condition. What is
 * stored is not always what was chosen: while the row is absent this follows the device's own
 * Reduce Motion setting, which the provider folds in before publishing (see `provider.tsx`).
 *
 * Almost nothing needs this. Reanimated is told once, at the root, and gates every animation in
 * the app from the inside — see `ReducedMotionConfig` in `app/_layout.tsx`. This is for the motion
 * Reanimated does not own: the navigator's screen transitions and the sheet library's own springs.
 */
export function useReduceMotion(): boolean {
  return usePreference('reduceMotion') === 'on';
}

export interface PreferenceWriter {
  /** True once the value is stored on the device. False means nothing was written at all. */
  set: (entry: PreferenceEntry) => boolean;
  reset: (key: PreferenceKey) => boolean;
}

/**
 * Reports whether the write landed, swallowing what stopped it.
 *
 * A caller gets one answer rather than two — false, or an exception — because there is only one
 * thing to do about either: put the control back where it was and say so. The local database
 * failing is not a case any screen can recover from, so the detail is for the log, not the user.
 *
 * Only the write is guarded. `setPreference` asks for a sync afterwards, and that call cannot fail
 * here: it sets a timer, and the run it schedules keeps its own failures to itself (§6).
 */
function attempt(write: () => void): boolean {
  try {
    write();
    return true;
  } catch (error) {
    if (__DEV__) console.warn('[preferences] write failed', error);
    return false;
  }
}

/**
 * Writers bound to the signed-in account. Both refuse before a session exists — a preference
 * written to no account could not be synced or read back — and refusing is not the same as
 * quietly doing nothing: the caller is told, so a control that moved can move back. The guest
 * session that makes an account exist is created at launch (§5), so this is a narrow window.
 */
export function usePreferenceWriter(): PreferenceWriter {
  const { data: session } = useSession();
  const userId = session?.user.id ?? NOBODY;

  const set = useCallback(
    (entry: PreferenceEntry) => (userId ? attempt(() => setPreference(userId, entry)) : false),
    [userId],
  );

  const reset = useCallback(
    (key: PreferenceKey) => (userId ? attempt(() => resetPreference(userId, key)) : false),
    [userId],
  );

  return useMemo(() => ({ set, reset }), [set, reset]);
}
