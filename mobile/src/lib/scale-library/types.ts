// A scale identity, in the same spirit as chord-library's chord types: the
// catalogue describes what a scale *is*, and everything that draws it derives
// from that. See index.ts for how this module sits next to the others.

export type ScaleFamily =
  'major-modes' | 'pentatonic' | 'harmonic-minor' | 'melodic-minor' | 'harmonic-major';

/** The three non-accent jewel hues in global.css, usable as a tint. */
export type JewelHue = 'amber' | 'rose' | 'violet';

export interface ScaleAccent {
  /** Degree label of the tone that gives the scale its flavour, e.g. '6', 'b2'. */
  degree: string;
  hue: JewelHue;
}

export interface ScaleType {
  id: string;
  name: string;
  family: ScaleFamily;
  /** Semitones above the root, ascending, starting at 0. */
  semitones: readonly number[];
  /**
   * One label per semitone: the scale-degree number with its accidental, ASCII
   * ('b3', '#4') because that is what the app converts to glyphs at the UI
   * boundary. Two tones may share a degree number — the blues scale spells both
   * a b5 and a 5 — and the spelling algorithm depends on that being written out.
   */
  degrees: readonly string[];
  /** One line on what the scale sounds like. */
  character: string;
  /**
   * The tone the neck tints, or null for the scales nothing deviates from —
   * major, natural minor, and the two plain pentatonics are the references.
   */
  accent: ScaleAccent | null;
}

/** A scale fixed to a root: the pair everything downstream actually needs. */
export interface Scale {
  root: string;
  type: ScaleType;
  /** Spelled note names, ascending, parallel to `type.semitones`. */
  notes: readonly string[];
  /** Pitch classes (0–11), parallel to `type.semitones`. */
  pitchClasses: readonly number[];
}
