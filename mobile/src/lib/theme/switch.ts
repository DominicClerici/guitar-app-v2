/**
 * Changing the appearance in front of somebody, held outside the tree.
 *
 * A theme cannot be crossfaded. The colours are variables the whole app reads through, so they
 * change between one frame and the next whatever is done to them — there is no interpolation to
 * hang an animation on, and animating a thousand components towards a thousand new values would be
 * the slowest possible way to arrive at a result the eye reads as a flash.
 *
 * So the screen is photographed instead, and the photograph is what moves:
 *
 *   1. the frame the user is looking at is captured and laid over the app,
 *   2. the theme is applied underneath it, where the re-render cannot be seen,
 *   3. the new frame is captured too, and
 *   4. it is opened up in a circle from the control that was pressed until it covers the screen.
 *
 * Two photographs rather than one, because there is no way in React Native to cut a hole in an
 * image: the growing circle has to be a layer of its own with the new screen inside it, sitting on
 * the old one. The compensation is that both layers are then still pictures, so the half second of
 * movement is a transform on the GPU with no layout, no re-render and no JavaScript in it at all.
 *
 * Outside the tree for the reason the curtain is (`features/curtain`): what starts a switch is a
 * row on the settings screen, and that screen is one of the things about to be replaced.
 *
 * Every path through here ends with the theme applied. A capture that fails, a photograph that
 * never loads, a device that cannot do this at all — each of them falls back to putting the theme
 * on plainly, which is the behaviour the app had before any of this existed.
 */
import { DEFAULT_PREFERENCES, themePreference, type ThemePreference } from '@guitar/shared';
import { useSyncExternalStore } from 'react';
import type { View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import { Uniwind } from 'uniwind';

import { readPreferences } from '@/lib/preferences';

import { applyTheme } from './apply';
import type { Point } from './reveal';

/**
 * JPEG rather than PNG, and this is the difference between a switch that starts when you press it
 * and one that starts a moment later: encoding a screenful of pixels losslessly costs more than
 * the whole rest of the sequence. Nothing here is looked at for longer than half a second, at its
 * own size, over the identical live screen.
 */
const SHOT = { format: 'jpg', quality: 0.92, result: 'tmpfile' } as const;

/**
 * Frames to let pass between applying the theme and photographing the result. The re-render it
 * sets off is synchronous, but the commit that follows it has to reach the screen before there is
 * anything new to capture — and one frame is the minimum rather than the safe number.
 */
const SETTLE_FRAMES = 3;

/**
 * The point past which something has gone wrong and the theme is put on plainly.
 *
 * Longer than the sequence can legitimately take, because it is not a deadline: everything here is
 * driven by a capture returning or a photograph loading, and this exists for the case where one of
 * them never does. The screen is frozen until it fires, so it must not be reached in normal use.
 */
const GIVE_UP_MS = 4000;

export interface Reveal {
  /** Distinguishes one switch from the next, so a second replaces rather than resumes the first. */
  id: number;
  /** Where on screen the choice was made, and so where the new screen opens from. */
  origin: Point;
  /** The screen as it was, held up from the moment it exists until the reveal is over. */
  before: string;
  /** The screen as it is now, once it has been photographed. */
  after: string | null;
  /** No second photograph is coming: the frozen frame should simply dissolve off the new one. */
  fading: boolean;
}

let current: Reveal | null = null;
/** What the switch on screen is heading for, and the flag for one being in flight at all. */
let target: ThemePreference | null = null;
/** What was last handed to uniwind. Its own starting state is adaptive, which is `system`. */
let applied: ThemePreference = DEFAULT_PREFERENCES.theme;
let surface: View | null = null;
let expiry: ReturnType<typeof setTimeout> | null = null;
let nextId = 1;

const listeners = new Set<() => void>();

function commit(next: Reveal | null): void {
  current = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function revealing(): Reveal | null {
  return current;
}

/** The switch on screen, or `null`. Only `ThemeSwitchHost` should need this. */
export function useThemeReveal(): Reveal | null {
  return useSyncExternalStore(subscribe, revealing, revealing);
}

/**
 * The view a frozen frame is a photograph of. Registered once, by the root layout.
 *
 * Everything the navigator draws is inside it and the window overlays — the toasts, the curtain,
 * this — are outside it, which is the right line: an overlay is above the app rather than part of
 * the screen being changed, and photographing one would leave it hanging in the frozen frame after
 * it had gone.
 */
export function setThemeSurface(view: View | null): void {
  surface = view;
}

/** Resolves once the screen has had `frames` chances to draw what was just committed. */
function afterFrames(frames: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => step(left - 1));
    };

    step(frames);
  });
}

/** Puts the theme on with nothing covering the screen — every fallback here ends in this. */
function settle(preference: ThemePreference): void {
  clear();
  applied = preference;
  applyTheme(preference);
}

/**
 * Takes down whatever is on screen and forgets the flight.
 *
 * The photographs are deleted last and on purpose. They are files, and the images drawing them are
 * still mounted at this point — decoded into memory, so the delete cannot pull the picture out from
 * under a frame that is still on the glass, but doing it in the other order would be relying on
 * that rather than on the order.
 */
function clear(): void {
  if (expiry) {
    clearTimeout(expiry);
    expiry = null;
  }

  const gone = current;
  target = null;

  if (!gone) return;

  commit(null);
  releaseCapture(gone.before);
  if (gone.after) releaseCapture(gone.after);
}

/**
 * The choice a settings row has just written, and the point on screen it was made at.
 *
 * Called after the write rather than before it, so what runs here is a change that has already
 * happened: the theme this applies is the one now stored, and there is nothing left to wait for or
 * to undo. Everything it declines to animate — a value that is already on, a second switch over the
 * top of one still running, a device with no screen to photograph, motion the user asked to be
 * spared — is left to `requestTheme`, which puts it on plainly when the write comes back round
 * through the preferences table.
 */
export function beginThemeSwitch(value: string, origin: Point): void {
  const parsed = themePreference.safeParse(value);
  if (!parsed.success) return;

  const next = parsed.data;

  if (target !== null || next === applied || !surface) return;
  if (readPreferences().reduceMotion === 'on') return;

  target = next;
  expiry = setTimeout(() => {
    if (__DEV__) console.warn('[theme] the switch never finished; applying it plainly');
    settle(next);
  }, GIVE_UP_MS);

  captureRef(surface, SHOT).then(
    (before) => {
      // Superseded while the shutter was open — by the watchdog, or by a value arriving from
      // another device. The photograph is of a screen nobody is waiting on any more.
      if (target !== next) {
        releaseCapture(before);
        return;
      }

      commit({ id: nextId++, origin, before, after: null, fading: false });
    },
    (error) => {
      if (__DEV__) console.warn('[theme] could not photograph the screen', error);
      settle(next);
    },
  );
}

/**
 * The theme the preferences table now holds, told to whoever is applying themes.
 *
 * Every change that is not somebody pressing the control comes through here — the first read at
 * launch, a value pulled from another device, a switch that declined to animate — and each of them
 * is applied on the spot. What it must not do is act on the change a switch is already carrying:
 * doing so would apply the theme under the frozen frame *before* the frame went up, and the switch
 * would then find nothing left to reveal.
 */
export function requestTheme(preference: ThemePreference): void {
  if (target === preference) return;

  // A different value while one is in flight — two devices disagreeing, which the newer write
  // settles. The switch is abandoned rather than finished: what it photographed is no longer where
  // the app is going.
  if (target !== null) {
    settle(preference);
    return;
  }

  if (preference === applied) return;
  settle(preference);
}

/**
 * The frozen frame is on the glass: the app underneath is now unobservable, so this is where the
 * theme goes on and the second photograph is taken.
 */
export function themeFrozen(id: number): void {
  if (current?.id !== id || target === null) return;

  const was = Uniwind.currentTheme;
  const next = target;

  applied = next;
  applyTheme(next);

  // `System` chosen on a phone already showing that palette, which is a real thing to press and
  // not a mistake — the setting changed, the appearance did not. There is nothing to reveal, and
  // the frozen frame is identical to what is under it, so it can go without anything being seen.
  if (Uniwind.currentTheme === was) {
    clear();
    return;
  }

  void afterFrames(SETTLE_FRAMES).then(async () => {
    if (current?.id !== id || !surface) return;

    try {
      const after = await captureRef(surface, SHOT);
      const frozen = current;

      if (frozen?.id !== id) {
        releaseCapture(after);
        return;
      }

      commit({ ...frozen, after });
    } catch (error) {
      // The theme is already on underneath. Without the second photograph there is nothing to open
      // up, so the frozen frame dissolves off it instead — which is the same change, said quietly.
      if (__DEV__) console.warn('[theme] could not photograph the new screen', error);
      themeFading(id);
    }
  });
}

/**
 * There is no new screen to open up after all — it was never photographed, or the photograph will
 * not draw. The theme is already on underneath, so the frozen frame dissolves off it instead, which
 * is the same change said quietly rather than a cut.
 */
export function themeFading(id: number): void {
  const frozen = current;
  if (frozen?.id !== id || frozen.fading) return;

  commit({ ...frozen, fading: true });
}

/**
 * The frozen frame itself will not draw, which takes the whole idea away: there is nothing to hide
 * the change behind and nothing to reveal it with. The theme goes on plainly, which is what this
 * setting did before any of this existed.
 */
export function themeAbandoned(id: number): void {
  if (current?.id !== id || target === null) return;
  settle(target);
}

/** The reveal has covered the screen, or the fallback has faded out. Either way, this is over. */
export function themeRevealed(id: number): void {
  if (current?.id !== id) return;
  clear();
}
