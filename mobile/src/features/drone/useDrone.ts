import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { useChordBuilder, type InitialVoicing } from '@/features/chord-detection/useChordBuilder';
import { chromaticName, type AccidentalSide } from '@/lib/accidentals';
import { buildChord, type RootName } from '@/lib/chord-library';
import { useAccidentalSide, useTuning } from '@/lib/preferences';
import { noteToSemitone } from '@/lib/theory';

import {
  getSnapshot,
  release,
  reset,
  setIntonation,
  setPitches,
  setVoiceId,
  start,
  stop,
  subscribe,
  toggle,
  type DroneSnapshot,
} from './droneEngine';
import type { Intonation } from './intonation';
import {
  chordPitches,
  clampOctave,
  neckPitches,
  notePitches,
  rootPitchFor,
  shiftOctave,
  voicedTones,
} from './voicing';

/** Named so the screen's lock can be released independently of anything else holding one. */
const KEEP_AWAKE_TAG = 'drone';

/** Where the notes come from: the catalogue, or a shape you build by hand. */
export type DroneMode = 'chords' | 'neck';

/**
 * The bare root, sitting where a chord quality sits. A single held tonic is the
 * most common thing to drone on and there is no chord type for one, so the
 * picker carries this alongside the real qualities.
 */
export const SINGLE_NOTE = 'note' as const;

const EM_DASH = '—';

export interface DroneSelection {
  /** MIDI pitches to sound, bottom up. */
  pitches: number[];
  /** The pitch just intonation measures every other from. */
  rootMidi: number;
  /** What the readout calls it. */
  title: string;
  /** Spelled note names, in sounding order. */
  notes: string[];
  /** Index into `notes` of the root, or -1 where there is no reading. */
  rootIndex: number;
}

const NOTHING: DroneSelection = {
  pitches: [],
  rootMidi: 40,
  title: EM_DASH,
  notes: [],
  rootIndex: -1,
};

/**
 * A shape sent over from another tool. The drone opens on the neck holding it,
 * and — where the sender asked for it — already sounding.
 */
export interface DroneHandoff extends InitialVoicing {
  autoStart?: boolean;
}

export type UseDroneResult = DroneSnapshot & {
  mode: DroneMode;
  root: RootName;
  /** Which way the root grid should spell its twelve, so the two cannot disagree. */
  side: AccidentalSide;
  quality: string;
  octave: number;
  selection: DroneSelection;
  /** False when there is nothing selected to sound. */
  ready: boolean;
  board: ReturnType<typeof useChordBuilder>;
  setMode: (mode: DroneMode) => void;
  setRoot: (root: RootName) => void;
  setQuality: (id: string) => void;
  setOctave: (octave: number) => void;
  setVoiceId: (id: string) => void;
  setIntonation: (mode: Intonation) => void;
  toggle: () => void;
};

/**
 * The screen's handle on the drone: what is selected, and what is sounding.
 *
 * The selection lives here because it is a question about music theory that
 * React is well placed to answer, and the sound lives in the engine because it
 * is a graph on the audio thread that no render should be involved in. The join
 * between them is one effect, handing down the pitches whenever they change —
 * which is also what makes a chord change under a running drone work at all.
 *
 * `handoff` is a shape arriving from another screen — the chord detector, so far.
 * It is read once, into the initial state rather than into an effect, so the neck
 * and the chord it sounds are right on the first render.
 */
/**
 * How the drone spells a black key with nothing chosen — sharps, which is what its root grid has
 * always shown and how the chromatic run is counted going up.
 */
export const DRONE_FALLBACK: AccidentalSide = 'sharp';

export function useDrone(handoff?: DroneHandoff): UseDroneResult {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const [mode, setMode] = useState<DroneMode>(handoff ? 'neck' : 'chords');
  // Held as a pitch class and spelled on the way out: a drone sounds a pitch, and no key or chord
  // stands over it to letter that pitch, so how it is written is the user's call and re-reads the
  // moment they change it. See `RootGrid`, which offers the twelve on the same side.
  const [rootPc, setRootPc] = useState(0);
  const [quality, setQuality] = useState<string>(SINGLE_NOTE);
  const [octave, setOctave] = useState(0);

  const side = useAccidentalSide(DRONE_FALLBACK);
  const tuning = useTuning();
  const root = chromaticName(rootPc, side) as RootName;
  const setRoot = useCallback((name: RootName) => setRootPc(noteToSemitone(name)), []);

  const handedOver = useRef(handoff !== undefined);
  const pendingStart = useRef(handoff?.autoStart === true);

  // A layout effect so it lands before the pitches effect below, which is where a
  // handed-over drone actually starts.
  useLayoutEffect(() => {
    if (handedOver.current) reset();
  }, []);

  const board = useChordBuilder(handoff);
  const { placed, chord: reading, rootPitchClass, nameForPitchClass } = board;

  const fromCatalogue = useMemo<DroneSelection>(() => {
    if (quality === SINGLE_NOTE) {
      const pitches = shiftOctave(notePitches(rootPc), octave);
      return { pitches, rootMidi: pitches[0], title: root, notes: [root], rootIndex: 0 };
    }

    // Collapsed spelling so the chips read the way the rest of the app names
    // notes — a Cdim7 sounds an A whatever the theory calls it.
    const chord = buildChord(root, quality, { spelling: 'collapsed' });
    const tones = voicedTones(chord);
    const pitches = shiftOctave(chordPitches(tones), octave);

    return {
      pitches,
      rootMidi: pitches[0],
      title: chord.symbol,
      notes: tones.map((tone) => tone.note),
      rootIndex: 0,
    };
  }, [root, rootPc, quality, octave]);

  const fromNeck = useMemo<DroneSelection>(() => {
    if (placed.length === 0) return NOTHING;

    const pitches = shiftOctave(neckPitches(tuning, placed), octave);
    const notes = pitches.map((pitch) => nameForPitchClass(pitch % 12));
    const rootMidi = rootPitchFor(pitches, rootPitchClass);

    return {
      pitches,
      rootMidi,
      // One note names itself; a shape is whatever the engine reads it as, and
      // an unnameable shape still sounds — it just has nothing to be called.
      title: reading?.name ?? (pitches.length === 1 ? notes[0] : EM_DASH),
      notes,
      rootIndex: rootPitchClass === null ? -1 : pitches.indexOf(rootMidi),
    };
  }, [tuning, placed, octave, nameForPitchClass, rootPitchClass, reading]);

  const selection = mode === 'chords' ? fromCatalogue : fromNeck;
  const { pitches, rootMidi } = selection;

  useEffect(() => {
    setPitches(pitches, rootMidi);

    // A handed-over chord starts here rather than on mount: the engine will not
    // start on nothing, and this is the first moment it has the notes.
    if (pendingStart.current && pitches.length > 0) {
      pendingStart.current = false;
      start();
    }
  }, [pitches, rootMidi]);

  useEffect(() => () => release(), []);

  // A drone runs while you play against it and nothing on this screen is
  // touched meanwhile. The lock lasts only as long as the sound.
  useEffect(() => {
    if (!snapshot.running) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [snapshot.running]);

  const changeMode = useCallback((next: DroneMode) => {
    // Switching where the notes come from replaces all of them, and carrying a
    // half-second of the old chord across the change reads as a fault.
    stop();
    setMode(next);
  }, []);

  const changeOctave = useCallback((next: number) => setOctave(clampOctave(next)), []);

  return {
    ...snapshot,
    mode,
    root,
    side,
    quality,
    octave,
    selection,
    ready: pitches.length > 0,
    board,
    setMode: changeMode,
    setRoot,
    setQuality,
    setOctave: changeOctave,
    setVoiceId,
    setIntonation,
    toggle,
  };
}
