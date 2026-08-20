/**
 * Changing the appearance in front of somebody, held outside the tree.
 *
 * A theme cannot be crossfaded. The colours are variables the whole app reads through, so they
 * change between one frame and the next whatever is done to them — there is no interpolation to
 * hang an animation on, and animating a thousand components towards a thousand new values would be
 * the slowest possible way to arrive at a result the eye reads as a flash.
 *
 * So a second copy of the screen is held over the app in the palette being left, and the new one is
 * opened up through it:
 *
 *   1. a still copy of what the user is looking at is mounted, pinned to the old palette, and laid
 *      over the app,
 *   2. the theme is applied underneath it, where the re-render cannot be seen, and
 *   3. a soft-edged hole is opened in the copy from the control that was pressed, growing until
 *      there is no copy left.
 *
 * The copy is components rather than a photograph, and that is the whole of the design here.
 * uniwind resolves a class through React context, so `ScopedTheme` can pin a subtree to the palette
 * the app is leaving while everything around it moves on — which means what is held up is the app's
 * own components, rendered once, rather than a screenful of pixels taken off the glass. What that
 * saves is not subtle: no snapshot of the view hierarchy on the main thread, no JPEG to encode and
 * decode, no full-screen texture to hold, and no step that can simply fail on a device too slow or
 * too full to take a picture. `components/navigation/FrozenScreen` is the copy; `frozen.ts` is the
 * little of the screen React does not already know how to render again.
 *
 * It buys one more thing, which is the reason to prefer it even where the picture was cheap. The
 * theme goes on at the *start*, under a copy of the screen as it was, so the app underneath is
 * already in its final state for the whole of the reveal: every touch during it lands on the real
 * screen, in the right palette and the right place, and nothing has to be locked out. A photograph
 * could never allow that — what it held up was a screen the app had already left, so anything the
 * user did to it would have been aimed at somewhere that no longer existed.
 *
 * `ThemeSwitchHost` holds the drawing of it, and why the hole is cut by Skia through a mask rather
 * than composed out of views.
 *
 * The stage goes up before the choice does. Mounting the copy is the slowest step left here — a
 * screen's worth of components rendered, measured and laid out — and none of it depends on *which*
 * appearance is picked. So `prepareThemeSwitch` raises it when the finger goes down and
 * `beginThemeSwitch` finds it already standing: the waiting happens during the press rather than
 * after it.
 *
 * Outside the tree for the reason the curtain is (`features/curtain`): what starts a switch is a
 * row on the settings screen, and that screen is one of the things about to be replaced.
 *
 * Every path through here ends with the theme applied. A palette that turns out not to change, a
 * switch overtaken by a value from another device, a device asked to spare the user motion — each
 * of them falls back to putting the theme on plainly, which is the behaviour the app had before any
 * of this existed.
 */
import { DEFAULT_PREFERENCES, themePreference, type ThemePreference } from '@guitar/shared';
import { useSyncExternalStore } from 'react';
import { Uniwind, type ThemeName } from 'uniwind';

import { readPreferences } from '@/lib/preferences';

import { applyTheme } from './apply';
import { takeStill } from './frozen';
import type { Point } from './reveal';

/**
 * Frames to let pass between applying the theme and opening the hole. The re-render it sets off is
 * synchronous, but the commit that follows it has to reach the screen before there is anything new
 * to reveal — and one frame is the minimum rather than the safe number.
 */
const SETTLE_FRAMES = 3;

/**
 * The point past which something has gone wrong and the theme is put on plainly.
 *
 * Longer than the sequence can legitimately take, because it is not a deadline: everything here is
 * driven by frames going by, and this exists for the case where they stop. The old screen is held
 * up until it fires, so it must not be reached in normal use.
 */
const GIVE_UP_MS = 4000;

/**
 * Why the appearance changed without a reveal, said out loud in development.
 *
 * Every fallback here ends the same way — the theme goes on plainly — which is the right behaviour
 * and an awful thing to diagnose: a switch that declined to animate and a switch that animated and
 * was not watched look identical from the outside, and half the ways out are ordinary enough that
 * they log nothing worth calling a warning. So each of them names itself instead, and the reason
 * there was no circle is a line in Metro rather than an afternoon.
 *
 * Silence therefore means the reveal ran. That is the useful half: it says the next place to look
 * is what was drawn, not what was decided.
 */
function declined(reason: string): void {
  if (__DEV__) console.warn(`[theme] no reveal — ${reason}`);
}

/**
 * Where the wait between the press and the first frame of the reveal went, in development.
 *
 * Spans rather than a total, because three separate things are slow here and none of them is fixed
 * the same way: getting the copy of the screen on to the glass, applying the theme — which
 * re-renders every component in the app, the copy included — and the frames deliberately let past
 * so that neither of the last two is caught happening. Which one dominates decides what is worth
 * attacking, and it is not something to guess at from the far side of a device.
 */
const spans: string[] = [];
let began = 0;
let marked = 0;

function startTiming(): void {
  if (!__DEV__) return;

  began = marked = Date.now();
  spans.length = 0;
}

function timing(span: string): void {
  if (!__DEV__) return;

  const now = Date.now();
  spans.push(`${span} ${now - marked}ms`);
  marked = now;
}

export interface Reveal {
  /** Distinguishes one switch from the next, so a second replaces rather than resumes the first. */
  id: number;
  /** Where on screen the choice was made, and so where the hole opens from. */
  origin: Point;
  /** The theme is on and the screen behind has settled: there is now something to reveal. */
  opening: boolean;
}

let current: Reveal | null = null;
/**
 * The palette the copy is pinned to while the stage is up, and the flag for it being up at all.
 *
 * Read at the press, which is the last moment it means what it says: from `themeFrozen` onwards the
 * app underneath is in the other palette and this is the only record of the one being left.
 */
let stage: ThemeName | null = null;
/** What the switch on screen is heading for, and the flag for one being in flight at all. */
let target: ThemePreference | null = null;
/** What was last handed to uniwind. Its own starting state is adaptive, which is `system`. */
let applied: ThemePreference = DEFAULT_PREFERENCES.theme;
let expiry: ReturnType<typeof setTimeout> | null = null;
let nextId = 1;

const listeners = new Set<() => void>();

function notify(): void {
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

function staging(): ThemeName | null {
  return stage;
}

/**
 * Raises or lowers the stage, which is the copy of the screen mounted and ready but not yet
 * covering anything.
 *
 * Rendering a screen's worth of components is the one genuinely slow thing left in a switch, and it
 * does not depend on the choice, so it happens where the capture used to: up when the finger lands,
 * down when the switch ends or the press comes to nothing. While it is up the copy is drawn with
 * nothing showing of it at all, so the press underneath is still the user's own screen answering.
 */
function raise(theme: ThemeName | null): void {
  if (stage === theme) return;

  stage = theme;
  notify();
}

/** The palette the copy is held in, or `null` for no stage. Only `ThemeSwitchHost` needs this. */
export function useFrozenPalette(): ThemeName | null {
  return useSyncExternalStore(subscribe, staging, staging);
}

/** The switch on screen, or `null`. Only `ThemeSwitchHost` should need this. */
export function useThemeReveal(): Reveal | null {
  return useSyncExternalStore(subscribe, revealing, revealing);
}

/**
 * Resolves once the screen has had `frames` chances to draw what was just committed, calling `each`
 * as every one of them goes by.
 */
function afterFrames(frames: number, each?: () => void): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => {
        each?.();
        step(left - 1);
      });
    };

    step(frames);
  });
}

/** Takes down whatever is on screen and forgets the flight. */
function clear(): void {
  if (expiry) {
    clearTimeout(expiry);
    expiry = null;
  }

  target = null;
  current = null;
  stage = null;
  notify();
}

/** Puts the theme on with nothing covering the screen — every fallback here ends in this. */
function settle(preference: ThemePreference): void {
  clear();
  applied = preference;
  applyTheme(preference);
}

function commit(next: Reveal): void {
  current = next;
  notify();
}

/**
 * A finger has gone down on the appearance control — the earliest the app can know that a switch is
 * probably coming, and so the earliest the copy can start being built.
 *
 * Safe to call on any press, including the ones that come to nothing: the stage comes down again
 * when the switch ends, and a switch that finds no stage standing raises its own.
 *
 * A press that comes to nothing does leave it standing until the next switch, though, and the copy
 * has one part that cannot keep up on its own — how far the two scrolling things have been scrolled
 * (`frozen.ts`). So every press reads those afresh, whether or not it is the press that raised the
 * stage: a copy built three taps and a swipe ago is right about everything else, and would be
 * holding up a tab bar left where it was three taps ago.
 */
export function prepareThemeSwitch(): void {
  // The one stage not to touch is one already in use: from `themeFrozen` on it is what is covering
  // the screen, and where the screen has got to since is not something to put on to a copy of it.
  if (target !== null) return;
  if (readPreferences().reduceMotion === 'on') return;

  takeStill();
  raise(Uniwind.currentTheme);
}

/**
 * The choice a settings row has just written, and the point on screen it was made at.
 *
 * Called after the write rather than before it, so what runs here is a change that has already
 * happened: the theme this applies is the one now stored, and there is nothing left to wait for or
 * to undo. Everything it declines to animate — a value that is already on, a second switch over the
 * top of one still running, motion the user asked to be spared — is left to `requestTheme`, which
 * puts it on plainly when the write comes back round through the preferences table.
 */
export function beginThemeSwitch(value: string, origin: Point): void {
  const parsed = themePreference.safeParse(value);

  if (!parsed.success) {
    declined(`'${value}' is not an appearance`);
    return;
  }

  const next = parsed.data;

  if (target !== null) {
    declined('one is already running');
    return;
  }

  if (next === applied) {
    declined(`'${next}' is already the setting`);
    return;
  }

  if (readPreferences().reduceMotion === 'on') {
    declined('reduce motion is on');
    return;
  }

  // Standing already in every ordinary case — the row reports the press, and the press is what
  // raised it. Raised here as well for the paths that reach a choice without one, and for the rare
  // stage that went up against a palette the device has since changed out from under.
  raise(Uniwind.currentTheme);

  target = next;
  startTiming();

  expiry = setTimeout(() => {
    declined('it never finished');
    settle(next);
  }, GIVE_UP_MS);

  // And once more with the choice made, which is the last instant the answer is still about the
  // screen the user is looking at rather than about a copy of it. Ordinarily this reads what the
  // press read a moment ago and says nothing; what it is here for is the bar that was still gliding
  // into place from a tab tapped just before, and had not finished when the press landed.
  takeStill();

  commit({ id: nextId++, origin, opening: false });
}

/**
 * The theme the preferences table now holds, told to whoever is applying themes.
 *
 * Every change that is not somebody pressing the control comes through here — the first read at
 * launch, a value pulled from another device, a switch that declined to animate — and each of them
 * is applied on the spot. What it must not do is act on the change a switch is already carrying:
 * doing so would apply the theme under the copy *before* the copy was covering anything, and the
 * switch would then find nothing left to reveal.
 */
export function requestTheme(preference: ThemePreference): void {
  if (target === preference) return;

  // A different value while one is in flight — two devices disagreeing, which the newer write
  // settles, or somebody pressing a second option through the reveal now that they can. The switch
  // is abandoned rather than finished: the screen it is holding up is no longer where the app is
  // going.
  if (target !== null) {
    settle(preference);
    return;
  }

  if (preference === applied) return;
  settle(preference);
}

/**
 * The copy is on the glass: the app underneath is now unobservable, so this is where the theme goes
 * on and, once the screen behind has caught up, where the hole starts opening.
 */
export function themeFrozen(id: number): void {
  if (current?.id !== id || target === null) return;

  timing('covered');

  const was = Uniwind.currentTheme;
  const next = target;

  applied = next;
  applyTheme(next);
  timing('theme applied');

  // `System` chosen on a phone already showing that palette, which is a real thing to press and
  // not a mistake — the setting changed, the appearance did not. There is nothing to reveal, and
  // the copy is identical to what is under it, so it can go without anything being seen.
  if (Uniwind.currentTheme === was) {
    declined(`'${next}' resolves to the '${was}' palette that was already on`);
    clear();
    return;
  }

  // Split so that the wait after applying is answerable rather than merely long. A macrotask cannot
  // run until the JavaScript thread is free; a frame callback cannot run until the main thread is.
  // A long `js idle` means React is still re-rendering the app, a short one against long frames
  // means the native side is still working through the appearance change, and those are not fixed
  // the same way.
  if (__DEV__) setTimeout(() => timing('js idle'), 0);

  void afterFrames(SETTLE_FRAMES, () => timing('frame')).then(() => {
    const frozen = current;
    if (frozen?.id !== id) return;

    commit({ ...frozen, opening: true });
  });
}

/** The hole has covered the screen: there is no copy left to hold up. */
export function themeRevealed(id: number): void {
  if (current?.id !== id) return;
  clear();
}
