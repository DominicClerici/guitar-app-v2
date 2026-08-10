/**
 * The UI thread's clock. Lives at module scope because the purity rule reads a
 * gesture callback as render-time code, and reading a clock there is not allowed —
 * true of a render, but these only ever run on a touch.
 */
export function uiNow(): number {
  'worklet';
  return performance.now();
}
