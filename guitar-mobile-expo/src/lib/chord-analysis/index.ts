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

import { buildChordTones } from './adapter'
import { chordSymbol, chordSymbolObjectToArray } from './chord-symbol'
import { noteToSemitone, OPEN_PITCHES, OPEN_PITCHES_MIDI } from '../theory'
import { rankVariations } from './ranking'
import type { ChordAnalysis, ChordResult, FretboardNote } from './types'
import { createVariations } from './variations'
import { chordWarnings } from './warnings'

// Open-string octaves for standard tuning, indexed by string number
// (0 = high e, 5 = low E). Standard tuning's lowest note is E2 (low E open).
//   high e (string 0) open = E4
//   B      (string 1) open = B3
//   G      (string 2) open = G3
//   D      (string 3) open = D3
//   A      (string 4) open = A2
//   low E  (string 5) open = E2
const OPEN_OCTAVE = [4, 3, 3, 3, 2, 2] as const

const PC_NAMES_FLAT = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
] as const

// Sort by ascending MIDI pitch so sorted[0] is the actual sounding bass —
// the lowest pitch produced anywhere on the fretboard, not the lowest-pitched
// physical string that happens to be played. Ties (same MIDI on two strings)
// break to the lower string index, matching findBass() in the voicing engine.
// createVariations() treats sorted[0] as the bass-as-root candidate, so this
// determines which interpretation becomes variations[0] / the primary name.
function preSortByMidi(notes: FretboardNote[]): FretboardNote[] {
  return [...notes].sort((a, b) => {
    const midiA = OPEN_PITCHES_MIDI[a.string] + a.fret
    const midiB = OPEN_PITCHES_MIDI[b.string] + b.fret
    if (midiA !== midiB) return midiA - midiB
    return a.string - b.string
  })
}

function noteWithOctave(note: FretboardNote): string {
  // Compute the absolute pitch class. Open-string pitch class + fret offset,
  // then take mod 12 to get the displayed pitch class. The octave shifts up
  // each time we cross from B to C in the chromatic ladder.
  const openPc = OPEN_PITCHES[note.string]
  const baseOctave = OPEN_OCTAVE[note.string]
  const totalSemitone = openPc + note.fret
  const octaveShift = Math.floor(totalSemitone / 12)
  const pc = totalSemitone % 12
  return PC_NAMES_FLAT[pc] + (baseOctave + octaveShift)
}

export function analyzeChord(
  notes: FretboardNote[],
  // Tiebreaker for genuinely-enharmonic roots/notes (see createVariations).
  accidentalPreference: 'sharp' | 'flat' = 'flat',
  // Spell every reading on this side, overriding the count-based choice. For
  // naming a chord inside a known key (sharp keys spell sharp, flat keys flat).
  forceAccidental?: 'sharp' | 'flat',
): ChordAnalysis | null {
  if (notes.length < 3) return null

  const sorted = preSortByMidi(notes)
  const noteStrings = sorted.map(noteWithOctave)
  const variations = createVariations(noteStrings, accidentalPreference, forceAccidental)
  if (variations.length === 0) return null

  const bassPitchClass = (OPEN_PITCHES[sorted[0].string] + sorted[0].fret) % 12
  const ranked = rankVariations(variations, bassPitchClass)

  const chordNames: ChordResult[] = ranked.map((v, i) => {
    const root = v.autoRootMode === 'sharp' ? v.rootToneSharp : v.rootToneFlat
    const csArray = chordSymbolObjectToArray(v.csParams)

    // Render as a slash chord whenever the reading's root isn't the sounding
    // bass — including the primary, since ranking may surface a non-bass root
    // (e.g. C/G for an open C voiced with G in the bass). notesFlatRoot[0] /
    // notesSharpRoot[0] is the bass note spelled in this reading's root side.
    let resultObj
    if (noteToSemitone(root) === bassPitchClass) {
      resultObj = chordSymbol([root, csArray])
    } else {
      const bassName = v.autoRootMode === 'sharp' ? v.notesSharpRoot[0] : v.notesFlatRoot[0]
      resultObj = chordSymbol([root, csArray, bassName])
    }

    return {
      name: resultObj.csFormatted,
      primary: i === 0,
      warnings: chordWarnings(v),
      chordTones: buildChordTones(v, bassPitchClass),
    }
  })

  return { chordNames, chordTones: chordNames[0].chordTones }
}

// ─── Public surface ────────────────────────────────────────────────────────
// analyzeChord (above) is the primary entry point, and EMPTY_CHORD_TONES is the
// blank grid a UI draws before there is a chord to fill it. The chromatic
// tables, note ↔ pitch-class maps and tuning constants now live in
// @/lib/theory — import them from there, not through this module.

export { EMPTY_CHORD_TONES } from './adapter'
export type {
    ChordAnalysis,
    ChordResult,
    ChordTones,
    FretboardNote,
    IntervalSlot,
    Warning
} from './types'
