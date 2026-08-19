/**
 * Changing the appearance in front of somebody, held outside the tree.
 *
 * A theme cannot be crossfaded. The colours are variables the whole app reads through, so they
 * change between one frame and the next whatever is done to them — there is no interpolation to
 * hang an animation on, and animating a thousand components towards a thousand new values would be
 * the slowest possible way to arrive at a result the eye reads as a flash.
 *
 * So the screen is photographed instead, and the new one is opened up through the photograph:
 *
 *   1. the frame the user is looking at is captured and laid over the app,
 *   2. the theme is applied underneath it, where the re-render cannot be seen, and
 *   3. a circular hole is opened in the photograph from the control that was pressed, growing
 *      until there is no photograph left.
 *
 * What the hole shows is the live app rather than a second photograph of it, and that is the whole
 * reason it is a hole. React Native cannot cut one — there is no `destination-out` among its blend
 * modes — but Skia can, and cutting needs one capture where two stacked layers need two. The screen
 * revealed is therefore the real one, already repainted, so an interruption leaves nothing stale
 * behind and there is no second shutter in the middle of the gesture. `ThemeSwitchHost` holds the
 * drawing of it, and why it is drawn there rather than composed out of views.
 *
 * The photograph is of the whole window rather than of a view, and that is not a simplification.
 * Capturing a *view* means handing the platform a react tag to look up among the views it has
 * mounted, and under the new architecture that lookup goes out through the legacy interop and comes
 * back empty here — the capture fails with a tag that names nothing. The window needs no lookup at
 * all. What it costs is that anything else in a window overlay is in the photograph too; since the
 * live one is still drawn directly over its own frozen copy, the two coincide and nothing shows.
 * Skia's own `makeImageFromView` is the same trap wearing different clothes — it resolves the tag
 * through `RCTUIManager` and calls `RCTFatal` when it comes back empty, so here it would not fail,
 * it would crash.
 *
 * The shutter opens before the choice does. Photographing the screen costs more than everything
 * else in the sequence put together — a snapshot of the whole view hierarchy, a JPEG encode of a
 * screenful of pixels, and a file to put it in — and none of it depends on *which* appearance is
 * picked. So `prepareThemeSwitch` takes the picture when the finger goes down and `beginThemeSwitch`
 * collects it: the waiting happens during the press rather than after it.
 *
 * Outside the tree for the reason the curtain is (`features/curtain`): what starts a switch is a
 * row on the settings screen, and that screen is one of the things about to be replaced.
 *
 * Every path through here ends with the theme applied. A capture that fails, a photograph that
 * never loads, a device that cannot do this at all — each of them falls back to putting the theme
 * on plainly, which is the behaviour the app had before any of this existed.
 */
import { DEFAULT_PREFERENCES, themePreference, type ThemePreference } from '@guitar/shared';
import { Skia, type SkImage } from '@shopify/react-native-skia';
import { useSyncExternalStore } from 'react';
import { captureScreen, releaseCapture } from 'react-native-view-shot';
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
 * Frames to let pass between applying the theme and opening the hole. The re-render it sets off is
 * synchronous, but the commit that follows it has to reach the screen before there is anything new
 * to reveal — and one frame is the minimum rather than the safe number.
 */
const SETTLE_FRAMES = 3;

/**
 * The point past which something has gone wrong and the theme is put on plainly.
 *
 * Longer than the sequence can legitimately take, because it is not a deadline: everything here is
 * driven by a capture returning or a photograph loading, and this exists for the case where one of
 * them never does. The screen is held until it fires, so it must not be reached in normal use.
 */
const GIVE_UP_MS = 4000;

/**
 * How long a photograph taken ahead of the choice stays usable.
 *
 * Long enough to cover a press — down, across, up — and short enough that a press somebody thought
 * better of cannot leave a picture of a screen that has since scrolled sitting ready to be held up
 * as though it were current. Past this it is thrown away and the switch takes its own, which is
 * what it did before any of this existed.
 */
const FRESH_MS = 1200;

/**
 * Photographs the screen and hands back something Skia can draw, with nothing left behind.
 *
 * Three steps that used to be spread across the press, the mount and the first frame: the native
 * capture, reading the file it wrote back into memory, and wrapping those bytes as an image. Run
 * together here so that all three can happen before the choice is made rather than after it.
 *
 * The file is deleted as soon as its contents are in memory. What gets drawn is the bytes — the
 * image holds them — so the file has no reader from that moment on, and a temp file outliving the
 * moment it was needed is only something else to get wrong.
 */
async function photograph(): Promise<SkImage> {
  const path = await captureScreen(SHOT);

  try {
    // `captureScreen` answers with a bare filesystem path, and Skia reads a source as a URI.
    const data = await Skia.Data.fromURI(path.startsWith('file://') ? path : `file://${path}`);
    const image = Skia.Image.MakeImageFromEncoded(data);

    if (!image) throw new Error('the bytes are not an image Skia can read');

    return image;
  } finally {
    releaseCapture(path);
  }
}

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
 * Spans rather than a total, because four separate things are slow here and none of them is fixed
 * the same way: photographing the screen, decoding that photograph back into a texture, applying
 * the theme — which re-renders every component in the app — and the frames deliberately let past so
 * that neither of the last two is caught happening. Which one dominates decides what is worth
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

function reportTiming(): void {
  if (!__DEV__ || began === 0) return;

  console.log(`[theme] ${spans.join(' · ')} — ${Date.now() - began}ms before the circle moved`);
}

export interface Reveal {
  /** Distinguishes one switch from the next, so a second replaces rather than resumes the first. */
  id: number;
  /** Where on screen the choice was made, and so where the hole opens from. */
  origin: Point;
  /** The screen as it was, ready to draw, held from the moment it exists until the reveal ends. */
  before: SkImage;
  /** The theme is on and the screen behind has settled: there is now something to reveal. */
  opening: boolean;
}

let current: Reveal | null = null;
/** What the switch on screen is heading for, and the flag for one being in flight at all. */
let target: ThemePreference | null = null;
/** What was last handed to uniwind. Its own starting state is adaptive, which is `system`. */
let applied: ThemePreference = DEFAULT_PREFERENCES.theme;
let expiry: ReturnType<typeof setTimeout> | null = null;
let nextId = 1;
/** A photograph taken before the choice was made, and the clock that throws it away unclaimed. */
let ahead: { shot: Promise<SkImage>; expiry: ReturnType<typeof setTimeout> } | null = null;
/** Whether the stage is up: a canvas mounted and empty, waiting for something to draw on it. */
let warming = false;

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

/**
 * Raises or lowers the stage.
 *
 * Mounting a canvas means creating a native view and a drawing surface for it, and measurement put
 * that on the critical path: it was happening after the choice, between the photograph arriving and
 * the theme going on. It does not depend on the choice either, so it goes where the capture went —
 * up when the finger lands, down when the switch ends or the press comes to nothing.
 */
function warm(on: boolean): void {
  if (warming === on) return;

  warming = on;
  for (const listener of listeners) listener();
}

function staging(): boolean {
  return warming;
}

/** Whether to hold a canvas ready. Only `ThemeSwitchHost` should need this. */
export function useThemeWarming(): boolean {
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

/** Puts the theme on with nothing covering the screen — every fallback here ends in this. */
function settle(preference: ThemePreference): void {
  clear();
  applied = preference;
  applyTheme(preference);
}

/**
 * Takes down whatever is on screen and forgets the flight.
 *
 * The photograph is let go last and on purpose. The image is still mounted at this point, so it is
 * taken down first and freed afterwards — doing it the other way round would hand a drawing its own
 * disposal and rely on the frame having already gone out.
 */
function clear(): void {
  if (expiry) {
    clearTimeout(expiry);
    expiry = null;
  }

  const gone = current;
  target = null;
  warm(false);

  if (!gone) return;

  commit(null);
  gone.before.dispose();
}

/** Throws away a photograph taken for a choice that never came, or that came too late for it. */
function forget(): void {
  const stale = ahead;
  ahead = null;

  if (!stale) return;

  clearTimeout(stale.expiry);
  warm(false);
  void stale.shot.then(
    (image) => image.dispose(),
    () => {},
  );
}

/** The photograph taken during the press if there is one still current, or a fresh one. */
function claim(): Promise<SkImage> {
  const taken = ahead;

  if (!taken) return photograph();

  ahead = null;
  clearTimeout(taken.expiry);

  return taken.shot;
}

/**
 * A finger has gone down on the appearance control — the earliest the app can know that a switch is
 * probably coming, and so the earliest the shutter can open.
 *
 * Safe to call on any press, including the ones that come to nothing: an unclaimed photograph
 * throws itself away after `FRESH_MS`, and a switch that finds none waiting takes its own.
 */
export function prepareThemeSwitch(): void {
  if (target !== null || ahead !== null) return;
  if (readPreferences().reduceMotion === 'on') return;

  const shot = photograph();

  // Answered here as well as where it is claimed, so a photograph nobody ends up asking for cannot
  // surface as an unhandled rejection a second after the press it belonged to.
  shot.catch(() => {});

  ahead = { shot, expiry: setTimeout(forget, FRESH_MS) };
  warm(true);
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

  target = next;
  startTiming();

  const prepared = ahead !== null;

  expiry = setTimeout(() => {
    declined('it never finished');
    settle(next);
  }, GIVE_UP_MS);

  claim().then(
    (before) => {
      timing(prepared ? 'photograph (taken during the press)' : 'photograph');

      // Superseded while the shutter was open — by the watchdog, or by a value arriving from
      // another device. The photograph is of a screen nobody is waiting on any more.
      if (target !== next) {
        before.dispose();
        return;
      }

      commit({ id: nextId++, origin, before, opening: false });
    },
    (error) => {
      declined(`the screen could not be photographed: ${String(error)}`);
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
 * doing so would apply the theme under the photograph *before* the photograph went up, and the
 * switch would then find nothing left to reveal.
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
 * The photograph is on the glass: the app underneath is now unobservable, so this is where the
 * theme goes on and, once the screen behind has caught up, where the hole starts opening.
 */
export function themeFrozen(id: number): void {
  if (current?.id !== id || target === null) return;

  timing('drawn');

  const was = Uniwind.currentTheme;
  const next = target;

  applied = next;
  applyTheme(next);
  timing('theme applied');

  // `System` chosen on a phone already showing that palette, which is a real thing to press and
  // not a mistake — the setting changed, the appearance did not. There is nothing to reveal, and
  // the photograph is identical to what is under it, so it can go without anything being seen.
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

    reportTiming();
    commit({ ...frozen, opening: true });
  });
}

/** The hole has covered the screen: there is no photograph left to hold up. */
export function themeRevealed(id: number): void {
  if (current?.id !== id) return;
  clear();
}
