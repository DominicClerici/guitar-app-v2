import { useCallback, useEffect, useSyncExternalStore } from 'react';

import {
  getSnapshot,
  release,
  setPitches,
  start,
  stop,
  subscribe,
} from '@/features/drone/droneEngine';

// A held root for an article block, over the drone screen's own engine.
//
// This deliberately does NOT go through `playbackBus`. That bus enforces one
// sound *source* at a time, which is right for two blocks each running a scale
// and wrong here: a drone is the backdrop the other source is heard against, and
// silencing it the moment a scale runs would remove the only reason it exists.
//
// The engine is a module-scope singleton shared with `/drone`, so ownership is
// read back off the snapshot rather than kept locally — a block is holding the
// drone only while the engine is running the pitch that block asked for.

export interface DroneHold {
  /** True while this block's root is the one sounding. */
  holding: boolean;
  toggle: () => void;
}

export function useDroneHold(rootMidi: number): DroneHold {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const holding =
    snapshot.running && snapshot.pitches.length === 1 && snapshot.pitches[0] === rootMidi;

  const toggle = useCallback(() => {
    if (getSnapshot().running) {
      stop();
      return;
    }
    // Root and pitch are the same note: a single held tonic is what a mode has
    // to be measured against, and `setPitches` wants both regardless.
    setPitches([rootMidi], rootMidi);
    start();
  }, [rootMidi]);

  useEffect(() => () => release(), []);

  return { holding, toggle };
}
