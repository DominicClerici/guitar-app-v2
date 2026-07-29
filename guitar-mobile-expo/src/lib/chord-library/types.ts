import type { Degree } from '../theory';

/**
 * The 17 root spellings the mixolydian skeleton supports. Gb and F# are both
 * here on purpose: they sound identical and spell differently, and a reference
 * tool should be able to show you either.
 */
export type RootName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B';

export type ChordFamily =
  | 'power'
  | 'triad'
  | 'sus'
  | 'added'
  | 'sixth'
  | 'seventh'
  | 'extended'
  | 'altered';

/** A chord quality, independent of any root. */
export interface ChordType {
  id: string;
  /** Full name, e.g. "Dominant Seventh". */
  name: string;
  /** Suffix printed after the root, e.g. "m7(b5)". Empty for a major triad. */
  symbol: string;
  family: ChordFamily;
  /**
   * The formula, as degree labels. Source of truth for both the spelling and
   * the pitch classes — see the note on `Degree`.
   */
  degrees: Degree[];
  /** Alternative names and symbols, for search. */
  aliases: string[];
  /**
   * Tones that may be sacrificed when a voicing cannot fit them all, in the
   * order to drop them. The essential tones — the ones that make the chord's
   * name true — are `degrees` minus this list. A fifth is usually first to go;
   * a diminished seventh has nothing to spare.
   */
  dropOrder: Degree[];
  /** Why the formula is what it is, where that isn't obvious. */
  note?: string;
}

export interface ChordTone {
  degree: Degree;
  /** Spelled note name, e.g. "Bb". */
  note: string;
  /** 0–11, C = 0. */
  pitchClass: number;
  /** 0–11 above the root. */
  semitones: number;
  /** False for tones in the type's `dropOrder`. */
  essential: boolean;
  /** True for b5/#5/b9/#9/#11/b13 — a hint for emphasis. */
  altered: boolean;
}

export interface Chord {
  root: RootName;
  type: ChordType;
  /** Root + suffix, e.g. "Gbmaj7". */
  symbol: string;
  /** In formula order, root first. */
  tones: ChordTone[];
  /**
   * Set when the enharmonic root spells this chord more simply — e.g. D#maj7
   * is truly D# F## A# C##, and this reads "Ebmaj7". Absent when the root is
   * the sensible one, including for chords whose correct spelling legitimately
   * needs a double flat (Cdim7 is C Eb Gb Bbb, and that is how it's written).
   */
  spellingHint?: string;
}

export interface BuildOptions {
  /**
   * 'correct' (default) keeps the theoretically true spelling, so a diminished
   * seventh reads Bbb and the degree labels stay coherent. 'collapsed' folds
   * double accidentals to their common names (Bbb → A), matching how the chord
   * detector displays notes.
   */
  spelling?: 'correct' | 'collapsed';
}
