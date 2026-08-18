import { Easing, ReduceMotion } from 'react-native-reanimated';

/**
 * How content arrives in this app.
 *
 * One definition rather than one per screen, because the arrival is a thing the app says about
 * itself: content rises the last few points into place while it fades up, on a decelerating curve,
 * so it reads as settling rather than as appearing. A step of onboarding does it, and so does the
 * welcome that plays after the last one — and the whole point of the welcome is that it continues
 * the movement the flow was already making, which it cannot do from a copy of these numbers that
 * is free to drift.
 */

/** How far content travels as it arrives. Short: this is a settle, not a slide. */
export const TRAVEL = 12;

export const ARRIVE_MS = 400;

export const ARRIVE = { duration: ARRIVE_MS, easing: Easing.out(Easing.cubic) };

/**
 * Spread into an animation that has to run even when motion is reduced.
 *
 * Reduce motion is switched on once, at the root, and Reanimated then makes every animation in the
 * app land on its final value instantly — which is right for almost all of them, and wrong for the
 * few where the movement *is* the reading rather than a flourish around it: a playhead crossing a
 * bar, a countdown emptying a ring, a metronome's flash, a needle following live pitch. Instantly
 * finished, those do not become calmer; they stop saying anything.
 *
 * So the exception is spelled out at each of them rather than inferred, and it is deliberately
 * awkward to reach for: four call sites are the whole list, and anything decorative that acquires
 * this is opting out of a setting the user asked for.
 */
export const ALWAYS_ANIMATE = { reduceMotion: ReduceMotion.Never } as const;
