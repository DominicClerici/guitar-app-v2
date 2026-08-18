import { useCallback, useEffect, useRef, useState } from 'react';

import type { Position } from '@/lib/guitar-positions';
import { soundingMidi, type Tuning } from '@/lib/tuning';

import { pluck, prepare, release } from './scalePluck';

/** One note of a run: where it sits on the neck, and what it sounds. */
export interface ScaleNote {
  key: string;
  midi: number;
}

/** One fixed practice speed. Slow enough to hear, quick enough to be a phrase. */
const STEP_MS = 320;

/**
 * The notes of a box in playing order — up, then back down without repeating the
 * top or bottom note. Boxes contain unisons (the same pitch on two strings), and
 * a scale that sounds the same note twice in a row reads as a mistake, so pitch
 * decides both the order and what counts as a duplicate.
 */
export function runThrough(tuning: Tuning, position: Position): ScaleNote[] {
  const byPitch = new Map<number, ScaleNote>();

  for (const key of position.keys) {
    const [string, fret] = key.split('-').map(Number);
    const midi = soundingMidi(tuning, string, fret);
    if (!byPitch.has(midi)) byPitch.set(midi, { key, midi });
  }

  const up = [...byPitch.values()].sort((a, b) => a.midi - b.midi);
  // Down again without striking the top note twice, and landing back where it
  // started — a run that stops one note short of home doesn't sound finished.
  return [...up, ...up.slice(0, -1).reverse()];
}

/**
 * Plays a run of notes, one every STEP_MS, and reports which is sounding so the
 * neck can light it.
 *
 * Each note is struck as its turn comes rather than the whole run being scheduled
 * in advance. That costs a little onset accuracy — inaudible at this tempo — and
 * buys a stop button that stops, instead of one that leaves ten seconds of
 * already-scheduled notes to play themselves out.
 */
export function usePlayScale() {
  const [playing, setPlaying] = useState(false);
  const [soundingKey, setSoundingKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clear();
    setPlaying(false);
    setSoundingKey(null);
  }, [clear]);

  const play = useCallback(
    (notes: readonly ScaleNote[]) => {
      clear();
      if (!notes.length) {
        stop();
        return;
      }

      void prepare();
      setPlaying(true);

      let index = 0;
      const step = () => {
        const note = notes[index];
        if (!note) {
          stop();
          return;
        }
        pluck(note.midi);
        setSoundingKey(note.key);
        index += 1;
      };

      step();
      timer.current = setInterval(step, STEP_MS);
    },
    [clear, stop],
  );

  /** Sounds one note on its own, for a tap on the neck. */
  const sound = useCallback((midi: number) => {
    void prepare();
    pluck(midi);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      release();
    },
    [],
  );

  return { playing, soundingKey, play, stop, sound };
}
