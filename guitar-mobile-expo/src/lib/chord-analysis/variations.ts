// Layer E — analyzer glue. For each unique input pitch class, treat it as the
// root, identify the chord (Layer B), spell the notes (Layer D), and decide
// flat- vs sharp-side spelling by counting accidentals. Returns one Variation
// per distinct input note, in chromatic order from the bass.

import { getChordInfo } from './chord-info'
import { getHalfSteps, getNotesFromIntervals, notesFlat, notesSharp } from '../theory'
import type { Variation } from './types'

export function noteToEnharmonic(note: string): string {
  if (note.indexOf('b') > -1) {
    const i = (notesFlat as readonly string[]).indexOf(note)
    return i > -1 ? notesSharp[i] : note
  }
  if (note.indexOf('#') > -1) {
    const i = (notesSharp as readonly string[]).indexOf(note)
    return i > -1 ? notesFlat[i] : note
  }
  return note
}

export function sortNotes(notes: string[]): string[] {
  const out: string[] = []
  out[0] = notes[0]

  let s = 0
  for (let e = 0; e < 12; e += 1) {
    if (notesFlat[e] === notes[0] || notesSharp[e] === notes[0]) {
      s = e
      break
    }
  }

  for (let e = 0; e < 12; e += 1) {
    for (let i = 1, a = notes.length; i < a; i += 1) {
      if (notesFlat[s] === notes[i] || notesSharp[s] === notes[i]) {
        out.push(notes[i])
        break
      }
    }
    if (s < 11) s += 1
    else s = 0
  }

  return out
}

function stripOctave(name: string): string {
  return name.replace(/[0-9]+$/, '')
}

export function createVariations(
  allSelectedNotesWithOctaves: string[],
  // Tiebreaker used only when sharp- and flat-side spellings are equally complex
  // (e.g. an F♯/G♭ chord). Otherwise the cleaner (fewer-accidental) side wins, so
  // this never overrides a theoretically-clearer spelling. Defaults to flats to
  // preserve the engine's historical behavior on ties.
  tieBreak: 'sharp' | 'flat' = 'flat',
): Variation[] {
  const noteNamesAllOccurrences = allSelectedNotesWithOctaves.map(stripOctave)
  const uniqueNotes = [...new Set(noteNamesAllOccurrences)]
  const sortedNotes = sortNotes(uniqueNotes)

  const variations: Variation[] = []
  for (const candidateRoot of uniqueNotes) {
    const enharmonic = noteToEnharmonic(candidateRoot)
    const halfStepsUnique = getHalfSteps(candidateRoot, sortedNotes)
    const halfStepsAll = getHalfSteps(candidateRoot, noteNamesAllOccurrences)
    const info = getChordInfo(halfStepsUnique)
    const intervals = halfStepsAll.map((hs) => info.intervalNames[hs])

    const notesFlatRoot  = getNotesFromIntervals(candidateRoot, intervals, false)
    const notesSharpRoot = getNotesFromIntervals(enharmonic,    intervals, false)

    // autoRootMode counts accidentals in the theoretically-correct spelling
    // (correct=true, which keeps bb/## rather than collapsing them) and picks
    // whichever side is cleaner. Genuine ties fall back to `tieBreak` (the user's
    // accidental preference). These "correct" spellings are only used for the
    // count — the displayed notes are the collapsed ones.
    const flatCorrect  = getNotesFromIntervals(candidateRoot, intervals, true)
    const sharpCorrect = getNotesFromIntervals(enharmonic,    intervals, true)
    let flatCount = 0
    let sharpCount = 0
    for (const n of flatCorrect) {
      if (n.includes('bb')) flatCount += 2
      else if (n.includes('b')) flatCount += 1
    }
    for (const n of sharpCorrect) {
      if (n.includes('##')) sharpCount += 2
      else if (n.includes('#')) sharpCount += 1
    }

    variations.push({
      ...info,
      uniqueHalfSteps: halfStepsUnique,
      rootToneFlat: candidateRoot,
      rootToneSharp: enharmonic,
      intervals,
      notesFlatRoot,
      notesSharpRoot,
      autoRootMode:
        sharpCount < flatCount ? 'sharp' : flatCount < sharpCount ? 'flat' : tieBreak,
    })
  }
  return variations
}
