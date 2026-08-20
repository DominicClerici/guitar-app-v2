/**
 * Where the screen was left, so the still copy of it can be put back in the same place.
 *
 * A change of appearance holds a second copy of the settings screen over the app while the theme
 * goes on underneath (`switch.ts`). The copy is the app's own components rendered again, so
 * everything React knows about arrives in it for free — the account, the stored preferences, every
 * measurement. What does not arrive is the part of the screen React never held: how far each of the
 * two scrolling things had been scrolled, which lives in the native views and dies with them.
 *
 * So the two offsets are published here as they change and read back on to the copy. Two numbers is
 * the whole of the fidelity problem: a copy that agrees with the screen everywhere else and starts
 * at the top of a list the user had scrolled halfway down is not a copy of anything.
 *
 * Shared values rather than plain numbers because of where the writes come from. The tab bar is
 * scrolled by an animation as often as by a finger, so it publishes from the scroll handler it
 * already runs on the UI thread; the settings list is only ever scrolled by hand, so it publishes
 * from JavaScript when the scrolling stops. Both are read from JavaScript.
 *
 * *When* they are read is the other half of it, and it is not when the copy mounts. The copy goes
 * up on the press and comes down when the switch ends, so a press that comes to nothing — the
 * option already chosen, a finger that slid off, a touch that turned into a scroll — leaves it
 * standing with nothing to do. Everything about it that React owns stays live and keeps up; these
 * two numbers are precisely the part that cannot, and by the next press the bar may have been
 * scrolled, or swiped clean across, since. So the reading is a moment rather than a mount:
 * `takeStill` is called by the press that builds the copy and again by the choice that shows it,
 * and what it publishes is what the copy puts itself back to.
 */
import { useSyncExternalStore } from 'react';
import { makeMutable } from 'react-native-reanimated';

/** The tab bar's horizontal content offset. Written by `TabBar`, on the UI thread. */
export const tabBarScroll = makeMutable(0);

/**
 * The settings list's vertical content offset, as of the last time scrolling stopped.
 *
 * Only ever sampled at the start of a switch, and a switch starts with a press — which cannot
 * happen while a finger is still dragging, and takes a first tap to stop a list that is still
 * gliding. So the value is current at every moment anything asks for it, without a handler running
 * per frame for the whole life of the app to keep it that way.
 */
export const settingsScroll = makeMutable(0);

/** Where the two scrolling things were, as of the last time anybody looked. */
export interface Still {
  tabBar: number;
  settings: number;
}

let still: Still = { tabBar: 0, settings: 0 };

const listeners = new Set<() => void>();

/**
 * Reads both offsets as they are now, and tells the copy if either has moved since it last looked.
 *
 * Called by `switch.ts` at the two moments a switch has an opinion about where the screen is: the
 * press, so the copy is built in the right place, and the choice, so it is in the right place at
 * the moment it is shown. The second is nearly always a no-op — a finger has been on the control
 * in between, and a finger cannot scroll two things at once — but nearly always is not a promise,
 * and a bar still gliding into place from a tab tapped a moment ago is the case it is not.
 */
export function takeStill(): void {
  const next = { tabBar: tabBarScroll.value, settings: settingsScroll.value };
  if (next.tabBar === still.tabBar && next.settings === still.settings) return;

  still = next;
  for (const listener of listeners) listener();
}

function snapshot(): Still {
  return still;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** The offsets the copy holds itself at. Only `FrozenScreen` needs these. */
export function useStill(): Still {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
