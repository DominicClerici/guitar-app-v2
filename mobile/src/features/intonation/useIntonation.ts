import { useCallback, useMemo, useState } from 'react';

import { centsBetween, meanHz } from './intonationMath';
import { STRING_COUNT, type GuitarString, type Stage } from './strings';
import { useGuitarStrings } from './useGuitarStrings';

/** Readings per stage. Two agreeing takes catch a bad pluck; more is a chore. */
export const TAKES = 2;

export type Phase = 'tune' | 'measure' | 'result' | 'summary';

export interface Measurement {
  stringId: string;
  harmonicHz: number;
  frettedHz: number;
  /** Fretted note against the harmonic. Positive is sharp. */
  cents: number;
}

interface Takes {
  harmonic: number[];
  fretted: number[];
}

const EMPTY: Takes = { harmonic: [], fretted: [] };

export interface Intonation {
  phase: Phase;
  /** The six as this screen walks them, thickest first — named for the user's own tuning. */
  strings: GuitarString[];
  index: number;
  string: GuitarString;
  stage: Stage;
  /** How many takes of the current stage are in the bag. */
  taken: number;
  results: Measurement[];
  result: Measurement | undefined;
  isLast: boolean;
  begin: () => void;
  capture: (hz: number) => void;
  redo: () => void;
  next: () => void;
  restart: () => void;
  cancel: () => void;
}

/**
 * Walks the six strings, four takes each: two of the 12th-fret harmonic, then two
 * of the 12th fret stopped. The harmonic is the reference — it is fixed by the
 * string itself rather than by where the saddle sits — so the error is the fretted
 * note measured against it, not against concert pitch. A string that is slightly
 * flat overall therefore still reads a true intonation error.
 */
export function useIntonation(): Intonation {
  const [phase, setPhase] = useState<Phase>('tune');
  const [index, setIndex] = useState(0);
  const [takes, setTakes] = useState<Takes>(EMPTY);
  const [results, setResults] = useState<Measurement[]>([]);

  const strings = useGuitarStrings();
  const string = strings[index];
  const stage: Stage = takes.harmonic.length < TAKES ? 'harmonic' : 'fretted';
  const taken = stage === 'harmonic' ? takes.harmonic.length : takes.fretted.length;
  const isLast = index === STRING_COUNT - 1;

  const result = useMemo(() => results.find((r) => r.stringId === string.id), [results, string.id]);

  const begin = useCallback(() => {
    setIndex(0);
    setTakes(EMPTY);
    setResults([]);
    setPhase('measure');
  }, []);

  const capture = useCallback(
    (hz: number) => {
      if (takes.harmonic.length < TAKES) {
        setTakes({ ...takes, harmonic: [...takes.harmonic, hz] });
        return;
      }

      const fretted = [...takes.fretted, hz];
      setTakes({ ...takes, fretted });
      if (fretted.length < TAKES) return;

      const harmonicHz = meanHz(takes.harmonic);
      const frettedHz = meanHz(fretted);
      const measurement: Measurement = {
        stringId: string.id,
        harmonicHz,
        frettedHz,
        cents: centsBetween(frettedHz, harmonicHz),
      };

      setResults((all) => [...all.filter((r) => r.stringId !== string.id), measurement]);
      setPhase('result');
    },
    [takes, string.id],
  );

  const redo = useCallback(() => {
    setTakes(EMPTY);
    setPhase('measure');
  }, []);

  const next = useCallback(() => {
    setTakes(EMPTY);
    if (index === STRING_COUNT - 1) {
      setPhase('summary');
      return;
    }
    setIndex(index + 1);
    setPhase('measure');
  }, [index]);

  const restart = useCallback(() => {
    setIndex(0);
    setTakes(EMPTY);
    setResults([]);
    setPhase('measure');
  }, []);

  const cancel = useCallback(() => {
    setTakes(EMPTY);
    setPhase('tune');
  }, []);

  return {
    phase,
    strings,
    index,
    string,
    stage,
    taken,
    results,
    result,
    isLast,
    begin,
    capture,
    redo,
    next,
    restart,
    cancel,
  };
}

/** Results in string order, so the summary reads top-down like the rail. */
export function orderedResults(
  strings: readonly GuitarString[],
  results: Measurement[],
): (Measurement | undefined)[] {
  return strings.map((s) => results.find((r) => r.stringId === s.id));
}
