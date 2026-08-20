/**
 * The order the pager's off-screen pages are brought up to a new palette in.
 *
 * A page of the pager is pinned to a palette of its own so that a change of appearance does not
 * reach the five tabs nobody is looking at (see `TopTabs`). The cost of that is bookkeeping: the
 * pinned pages have to be repainted by hand afterwards, and doing all five in one commit would put
 * back exactly the stall the pinning was for.
 *
 * So they are repainted a batch per frame, and this decides the batches. Pure, and separate from
 * the component, because what it has to get right — that nothing is missed, nothing is done twice,
 * and the pages a swipe can reach come first — is worth stating as a test rather than as a claim.
 */

/**
 * The pages to repaint, in order, one batch per frame.
 *
 * The neighbours go together and first: they are the only pages a swipe can bring on screen before
 * the walk is over, and a page seen in the palette the app has left is the one visible way this
 * approach can fail. Everything else follows one at a time, nearest first, so that no single frame
 * carries more than a screen's worth of work.
 *
 * `active` is left out. It is painted during render, before any of this runs, because it is already
 * on screen and cannot wait a frame.
 */
export function repaintBatches(active: number, count: number): number[][] {
  const near: number[] = [];
  const far: number[] = [];

  for (let step = 1; step < count; step++) {
    for (const index of [active - step, active + step]) {
      if (index < 0 || index >= count) continue;

      (step === 1 ? near : far).push(index);
    }
  }

  return near.length === 0 ? far.map((index) => [index]) : [near, ...far.map((index) => [index])];
}
