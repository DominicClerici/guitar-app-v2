import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import {
  acquire,
  centsSV,
  claritySV,
  frameSV,
  getSnapshot,
  presenceSV,
  release,
  rmsSV,
  subscribe,
  type TunerSnapshot,
} from './tunerEngine';

export type UseTunerResult = TunerSnapshot & {
  centsSV: typeof centsSV;
  claritySV: typeof claritySV;
  rmsSV: typeof rmsSV;
  presenceSV: typeof presenceSV;
  frameSV: typeof frameSV;
};

/**
 * Read-only view of the shared tuner. Subscribing does not turn the mic on — mounting
 * a second reader (as `TopTabs` does with its transition overlay) is free.
 */
export function useTuner(): UseTunerResult {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snapshot, centsSV, claritySV, rmsSV, presenceSV, frameSV };
}

export type UseTunerSessionResult = UseTunerResult & {
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
};

/**
 * `useTuner` plus ownership of a mic lease. The lease is released on unmount, so a
 * consumer can never strand the native session.
 */
export function useTunerSession(): UseTunerSessionResult {
  const tuner = useTuner();
  const leasedRef = useRef(false);

  const start = useCallback(async () => {
    if (leasedRef.current) return;
    leasedRef.current = true;
    const status = await acquire();
    if (status === 'denied' || status === 'unavailable') leasedRef.current = false;
  }, []);

  const stop = useCallback(() => {
    if (!leasedRef.current) return;
    leasedRef.current = false;
    release();
  }, []);

  const toggle = useCallback(() => {
    if (leasedRef.current) stop();
    else void start();
  }, [start, stop]);

  useEffect(
    () => () => {
      if (leasedRef.current) {
        leasedRef.current = false;
        release();
      }
    },
    [],
  );

  return { ...tuner, start, stop, toggle };
}
