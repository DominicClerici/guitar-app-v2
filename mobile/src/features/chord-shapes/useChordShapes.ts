import { useCallback, useMemo, useState } from 'react';

import { buildChord, type RootName } from '@/lib/chord-library';
import { chordShapes, groupByRegion } from '@/lib/guitar-voicings';

/**
 * A chord being looked up, and how much of its neck is on show.
 *
 * The chord itself is the only real state — everything below it is derived, and
 * the engine memoises per chord, so flipping between "see all" and back does no
 * work twice.
 */
export function useChordShapes(initialRoot: RootName = 'C', initialQuality = 'maj') {
  const [root, setRoot] = useState<RootName>(initialRoot);
  const [quality, setQuality] = useState(initialQuality);
  const [showAll, setShowAll] = useState(false);
  const [showInversions, setShowInversions] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const chord = useMemo(() => buildChord(root, quality), [root, quality]);
  const shapes = useMemo(() => chordShapes(chord), [chord]);

  const inversionGroups = useMemo(
    () => (showInversions ? groupByRegion(shapes.inversions) : []),
    [shapes, showInversions],
  );

  // Changing the chord invalidates the open card: its shape belongs to a
  // different chord and would otherwise stay expanded under the new one.
  const chooseRoot = useCallback((next: RootName) => {
    setRoot(next);
    setSelectedId(null);
  }, []);

  const chooseQuality = useCallback((next: string) => {
    setQuality(next);
    setSelectedId(null);
  }, []);

  const select = useCallback(
    (id: string) => setSelectedId((current) => (current === id ? null : id)),
    [],
  );

  const groups = showAll ? shapes.all : shapes.featured;

  return {
    chord,
    root,
    quality,
    groups,
    total: shapes.total,
    shown: groups.reduce((count, group) => count + group.voicings.length, 0),
    showAll,
    toggleAll: () => setShowAll((value) => !value),
    inversionGroups,
    inversionCount: shapes.inversions.length,
    showInversions,
    toggleInversions: () => setShowInversions((value) => !value),
    selectedId,
    select,
    setRoot: chooseRoot,
    setQuality: chooseQuality,
  };
}
