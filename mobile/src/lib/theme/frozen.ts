/**
 * Where the screen was left, so the still copy of it can be put back in the same place.
 *
 * A change of appearance holds a second copy of the settings screen over the app while the theme
 * goes on underneath (`switch.ts`). The copy is the app's own components rendered again, so
 * everything React knows about arrives in it for free — the account, the stored preferences, every
 * measurement. What does not arrive is the part of the screen React never held: how far each of the
 * two scrolling things had been scrolled, which lives in the native views and dies with them.
 *
 * So the two offsets are published here as they change and read back when the copy mounts. Two
 * numbers is the whole of the fidelity problem: a copy that agrees with the screen everywhere else
 * and starts at the top of a list the user had scrolled halfway down is not a copy of anything.
 *
 * Shared values rather than plain numbers because of where the writes come from. The tab bar is
 * scrolled by an animation as often as by a finger, so it publishes from the scroll handler it
 * already runs on the UI thread; the settings list is only ever scrolled by hand, so it publishes
 * from JavaScript when the scrolling stops. Both are read from JavaScript, once, at mount.
 */
import { makeMutable } from 'react-native-reanimated';

/** The tab bar's horizontal content offset. Written by `TabBar`, on the UI thread. */
export const tabBarScroll = makeMutable(0);

/**
 * The settings list's vertical content offset, as of the last time scrolling stopped.
 *
 * Only ever read at the start of a switch, and a switch starts with a press — which cannot happen
 * while a finger is still dragging, and takes a first tap to stop a list that is still gliding. So
 * the value is current at every moment anything asks for it, without a handler running per frame
 * for the whole life of the app to keep it that way.
 */
export const settingsScroll = makeMutable(0);
