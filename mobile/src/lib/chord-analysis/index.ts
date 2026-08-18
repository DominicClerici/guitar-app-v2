// Public API for the chord-analysis engine. See ANALYSIS.md for the full
// reference. Pipeline:
//
//   FretboardNote[] (≥3 unique pitch classes)
//     → preSortByMidi (sounding bass first)
//     → map to "<NOTE><OCTAVE>" strings
//     → createVariations (one "this note is the root" reading per pitch class)
//     → rankVariations (primary first, cap at 5)
//     → format each ranked variation via chordSymbol (slash for index>0)
//     → run chordWarnings per variation
//     → buildChordTones per ranked variation (grid per reading; primary aliased)
//     → ChordAnalysis

import { buildChordTones } from './adapter';
import { chordSymbol, chordSymbolObjectToArray } from './chord-symbol';
import { soundingMidi, soundingPitchClass, type Tuning } from '../tuning';
import { noteToSemitone } from '../theory';
import { rankVariations } from './ranking';
import type { ChordAnalysis, ChordResult, FretboardNote } from './types';
import { createVariations } from './variations';
import { chordWarnings } from './warnings';

const PC_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

// Sort by ascending MIDI pitch so sorted[0] is the actual sounding bass —
// the lowest pitch produced anywhere on the fretboard, not the lowest-pitched
// physical string that happens to be played. Ties (same MIDI on two strings)
// break to the lower string index, matching findBass() in the voicing engine.
// createVariations() treats sorted[0] as the bass-as-root candidate, so this
// determines which interpretation becomes variations[0] / the primary name.
function preSortByMidi(tuning: Tuning, notes: FretboardNote[]): FretboardNote[] {
  return [...notes].sort((a, b) => {
    const midiA = soundingMidi(tuning, a.string, a.fret);
    const midiB = soundingMidi(tuning, b.string, b.fret);
    if (midiA !== midiB) return midiA - midiB;
    return a.string - b.string;
  });
}

// The sounding pitch, written the way createVariations parses it. Both halves
// come off the one MIDI number: a table of open-string octaves per string used
// to sit here beside the pitch classes, which was a second statement of the
// tuning that nothing would have flagged when the first one changed.
function noteWithOctave(tuning: Tuning, note: FretboardNote): string {
  const midi = soundingMidi(tuning, note.string, note.fret);

  return PC_NAMES_FLAT[midi % 12] + (Math.floor(midi / 12) - 1);
}

export function analyzeChord(
  // The neck the notes were played on. First, and required, because every pitch
  // below is read off it — a default would let a caller forget and get a name
  // that is right for a guitar the user is not holding.
  tuning: Tuning,
  notes: FretboardNote[],
  // Tiebreaker for genuinely-enharmonic roots/notes (see createVariations).
  accidentalPreference: 'sharp' | 'flat' = 'flat',
  // Spell every reading on this side, overriding the count-based choice. For
  // naming a chord inside a known key (sharp keys spell sharp, flat keys flat).
  forceAccidental?: 'sharp' | 'flat',
): ChordAnalysis | null {
  if (notes.length < 3) return null;

  const sorted = preSortByMidi(tuning, notes);
  const noteStrings = sorted.map((note) => noteWithOctave(tuning, note));
  const variations = createVariations(noteStrings, accidentalPreference, forceAccidental);
  if (variations.length === 0) return null;

  const bassPitchClass = soundingPitchClass(tuning, sorted[0].string, sorted[0].fret);
  const ranked = rankVariations(variations, bassPitchClass);

  const chordNames: ChordResult[] = ranked.map((v, i) => {
    const root = v.autoRootMode === 'sharp' ? v.rootToneSharp : v.rootToneFlat;
    const csArray = chordSymbolObjectToArray(v.csParams);

    // Render as a slash chord whenever the reading's root isn't the sounding
    // bass — including the primary, since ranking may surface a non-bass root
    // (e.g. C/G for an open C voiced with G in the bass). notesFlatRoot[0] /
    // notesSharpRoot[0] is the bass note spelled in this reading's root side.
    let resultObj;
    if (noteToSemitone(root) === bassPitchClass) {
      resultObj = chordSymbol([root, csArray]);
    } else {
      const bassName = v.autoRootMode === 'sharp' ? v.notesSharpRoot[0] : v.notesFlatRoot[0];
      resultObj = chordSymbol([root, csArray, bassName]);
    }

    return {
      name: resultObj.csFormatted,
      primary: i === 0,
      warnings: chordWarnings(v),
      chordTones: buildChordTones(v, bassPitchClass),
    };
  });

  return { chordNames, chordTones: chordNames[0].chordTones };
}

// ─── Public surface ────────────────────────────────────────────────────────
// analyzeChord (above) is the primary entry point, and EMPTY_CHORD_TONES is the
// blank grid a UI draws before there is a chord to fill it. The chromatic
// tables, note ↔ pitch-class maps and tuning constants now live in
// @/lib/theory — import them from there, not through this module.

export { EMPTY_CHORD_TONES } from './adapter';
export type {
  ChordAnalysis,
  ChordResult,
  ChordTones,
  FretboardNote,
  IntervalSlot,
  Warning,
} from './types';
