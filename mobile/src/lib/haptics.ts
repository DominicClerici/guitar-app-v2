/**
 * Every haptic the app plays, and the one place the setting that silences them is read.
 *
 * Nothing else imports `expo-haptics`. That is the whole mechanism: a preference that has to be
 * honoured by nineteen call sites is honoured by none of them sooner or later, so the check lives
 * under the call rather than beside it, and a feature asking for a knock cannot forget to ask
 * whether knocks are wanted.
 *
 * The gate is read imperatively rather than through a hook, because most of these are not called
 * from anywhere a hook could reach: two are module-scope functions in engines that no component
 * owns, and eight more are handed to `runOnJS` from a gesture worklet. A hook would mean threading
 * the answer through a shared value into every one of them. This is a property lookup on a store
 * that is already published and already synchronous, and it re-renders nothing when the toggle
 * moves — the next haptic simply does not play.
 *
 * `snapshot` directly rather than the barrel: the barrel pulls in the provider, and through it the
 * database, which is more than a module this small should drag behind it.
 *
 * The names are the ones `expo-haptics` uses, not a vocabulary of our own. A call site asking for
 * `medium` is asking for the same thing it was asking for before, and inventing `thud` for it
 * would only add a table to look up.
 */
import * as Haptics from 'expo-haptics';

import { readPreferences } from '@/lib/preferences/snapshot';

/**
 * There is no reading of whether the phone itself plays haptics — see `preferences/system.ts` —
 * so this preference is the only gate there is, and it starts on.
 */
function wanted(): boolean {
  return readPreferences().haptics === 'on';
}

/**
 * Fire and forget. Every one of these returns a promise that no caller has ever awaited, and the
 * failure it can reject with — a device with no haptic engine — is not one anything can act on.
 */
export const haptics = {
  /** Crossing a detent: a slot, a step, a notch on a rail. The lightest thing here. */
  selection(): void {
    if (wanted()) void Haptics.selectionAsync();
  },

  /** A small knock: a pad struck, a chip lifted, a step taken. */
  light(): void {
    if (wanted()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** A heavier landing: a sample captured, a menu opened, an accented beat. */
  medium(): void {
    if (wanted()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  success(): void {
    if (wanted()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  warning(): void {
    if (wanted()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  error(): void {
    if (wanted()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
