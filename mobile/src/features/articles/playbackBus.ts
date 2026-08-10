// One sound source at a time, article-wide. An article can hold several live
// components that make sound; starting one should silence whichever was
// playing, without the components knowing about each other. Module scope is the
// coordination point — no provider, no context.

let activeStop: (() => void) | null = null;

/** Call when starting playback. Stops whoever was playing before you. */
export function claimPlayback(stop: () => void): void {
  if (activeStop && activeStop !== stop) activeStop();
  activeStop = stop;
}

/** Call when playback ends or the component unmounts, with the same `stop`. */
export function releasePlayback(stop: () => void): void {
  if (activeStop === stop) activeStop = null;
}
