import type { FretboardNote } from '@/lib/chord-analysis';

export type TriadQuality = 'maj' | 'min' | 'dim' | 'aug' | 'sus' | 'power' | 'unknown';
export type SeventhQuality = 'none' | 'min7' | 'maj7' | 'dim7';

export type Quality =
  | 'maj'
  | 'min'
  | 'dim'
  | 'aug'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'min7b5'
  | 'dim7'
  | 'minMaj7'
  | 'sus'
  | 'power'
  | 'unknown';

/** The harmonic content of one chord, reduced to what key estimation needs. */
export interface ChordFeature {
  rootPc: number;
  bassPc: number | null;
  triad: TriadQuality;
  seventh: SeventhQuality;
  pitchClasses: number[];
}

export interface ProgressionChord {
  id: string;
  voicing: FretboardNote[];
  /**
   * Every plausible reading of the voicing, in the analyzer's ranked order —
   * never empty. The progression stores them all so the key engine can choose
   * the combination across chords that best explains a key, instead of being
   * stuck with whichever reading was on screen at add time.
   */
  readings: ChordFeature[];
  /** Index of the reading the user explicitly chose; null lets the engine pick. */
  pinned: number | null;
}

export type Mode = 'major' | 'minor';

export interface KeyCandidate {
  tonicPc: number;
  mode: Mode;
  name: string;
  /** Raw hybrid score. Internal — rank with it, don't display it. */
  score: number;
  /** Softmax share across all 24 keys. See keyStrength before rendering. */
  confidence: number;
  /**
   * The reading of each chord this key's score was computed with, index-aligned
   * with the progression it was estimated from. Pinned chords always hold their
   * pinned index; the rest hold whatever reading scored best for this key.
   */
  assignment: number[];
}

export type KeyStatus = 'confident' | 'ambiguous' | 'insufficient';

export interface KeyEstimate {
  best: KeyCandidate | null;
  candidates: KeyCandidate[];
  status: KeyStatus;
}

export interface RomanLabel {
  roman: string;
  degree: number;
  accidental: '' | '♭' | '♯';
  isDiatonic: boolean;
}

export interface DegreeSlot {
  degree: number;
  accidental: '' | '♭' | '♯';
}
