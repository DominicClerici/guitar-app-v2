import { Easing } from 'react-native-reanimated';

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
