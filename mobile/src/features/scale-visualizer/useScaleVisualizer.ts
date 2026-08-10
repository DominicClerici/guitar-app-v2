import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useState } from 'react';

import type { RootName } from '@/lib/chord-library';
import { positionsFor, systemsFor, type PositionSystem } from '@/lib/guitar-positions';
import {
  accentPitchClass,
  buildScale,
  intervalLabel,
  relatedScales,
  type JewelHue,
} from '@/lib/scale-library';
import { midiAt } from '@/lib/theory';

import { runThrough, usePlayScale } from './usePlayScale';

/** What the dots on the neck say. */
export type LabelMode = 'notes' | 'degrees' | 'intervals';

/** How a dot is weighted. The root is lit, the scale's character tone is tinted. */
export type DotTone = 'root' | 'accent' | 'plain';

export interface Cell {
  label: string;
  tone: DotTone;
}

/**
 * The scale being looked at, and how much of the neck is lit.
 *
 * Five things are held: root, scale, what the dots say, how the neck is carved
 * into boxes, and which box. Everything else — the spelled scale, its boxes, the
 * twelve pitch classes the neck draws from, its neighbours — is derived, so there
 * is no way for the board and the pickers to disagree.
 */
export function useScaleVisualizer(initialRoot: RootName = 'C', initialScale = 'major') {
  const [root, setRoot] = useState<RootName>(initialRoot);
  const [scaleId, setScaleId] = useState(initialScale);
  const [labelMode, setLabelMode] = useState<LabelMode>('notes');
  const [preferredSystem, setPreferredSystem] = useState<PositionSystem>('caged');
  const [positionIndex, setPositionIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const player = usePlayScale();

  const scale = useMemo(() => buildScale(root, scaleId), [root, scaleId]);
  const systems = useMemo(() => systemsFor(scale), [scale]);

  // A five-note scale has no three-per-string shapes, so the preference is only a
  // preference — the system in force is always one the scale actually offers.
  const system = systems.includes(preferredSystem) ? preferredSystem : systems[0];
  const positions = useMemo(() => positionsFor(scale, system), [scale, system]);

  // Clamped on read rather than corrected in an effect, so changing to a scale
  // with fewer boxes can never leave the board pointing at one that isn't there.
  const index =
    positionIndex === null ? null : Math.min(positionIndex, Math.max(0, positions.length - 1));
  const position = index === null ? null : (positions[index] ?? null);

  const cells = useMemo(() => {
    const accent = accentPitchClass(scale);
    const map = new Map<number, Cell>();

    scale.type.semitones.forEach((semitone, slot) => {
      const degree = scale.type.degrees[slot];
      const label =
        labelMode === 'notes'
          ? scale.notes[slot]
          : labelMode === 'degrees'
            ? degree
            : intervalLabel(degree, semitone);

      map.set(scale.pitchClasses[slot], {
        label,
        tone: slot === 0 ? 'root' : scale.pitchClasses[slot] === accent ? 'accent' : 'plain',
      });
    });
    return map;
  }, [scale, labelMode]);

  const related = useMemo(() => relatedScales(scale), [scale]);
  const hue: JewelHue | null = scale.type.accent?.hue ?? null;

  const chooseRoot = useCallback(
    (next: RootName) => {
      player.stop();
      setRoot(next);
    },
    [player],
  );

  const chooseScale = useCallback(
    (next: string) => {
      player.stop();
      setScaleId(next);
    },
    [player],
  );

  const chooseSystem = useCallback(
    (next: PositionSystem) => {
      player.stop();
      setPreferredSystem(next);
    },
    [player],
  );

  /** Jump straight to another scale, for a tap on a related-scale row. */
  const goTo = useCallback(
    (nextRoot: RootName, nextScale: string) => {
      player.stop();
      setRoot(nextRoot);
      setScaleId(nextScale);
    },
    [player],
  );

  const choosePosition = useCallback(
    (next: number | null) => {
      player.stop();
      setPositionIndex(next);
      void Haptics.selectionAsync();
    },
    [player],
  );

  /**
   * Steps the pager. The whole neck is one of the stops rather than a mode you
   * leave, so walking off either end of the boxes lands back on it.
   */
  const stepPosition = useCallback(
    (delta: number) => {
      if (!positions.length) return;

      const next =
        index === null
          ? delta > 0
            ? 0
            : positions.length - 1
          : index + delta < 0 || index + delta >= positions.length
            ? null
            : index + delta;

      choosePosition(next);
    },
    [choosePosition, index, positions.length],
  );

  /**
   * Play means play *this shape*, so with the whole neck showing it takes the
   * first box rather than inventing a path of its own.
   */
  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.stop();
      return;
    }

    const target = position ?? positions[0];
    if (!target) return;

    if (!position) setPositionIndex(0);
    player.play(runThrough(target));
  }, [player, position, positions]);

  const soundAt = useCallback(
    (string: number, fret: number) => player.sound(midiAt(string, fret)),
    [player],
  );

  return {
    scale,
    cells,
    hue,
    related,

    root,
    scaleId,
    setRoot: chooseRoot,
    setScale: chooseScale,
    goTo,

    labelMode,
    setLabelMode,

    systems,
    system,
    setSystem: chooseSystem,

    positions,
    position,
    positionIndex: index,
    setPosition: choosePosition,
    stepPosition,

    playing: player.playing,
    soundingKey: player.soundingKey,
    togglePlay,
    soundAt,

    expanded,
    setExpanded,
  };
}

export type ScaleVisualizer = ReturnType<typeof useScaleVisualizer>;
