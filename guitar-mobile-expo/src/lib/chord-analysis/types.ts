// All types for the chord-analysis engine. The app-facing subset
// (ChordAnalysis, ChordResult, ChordTones, IntervalSlot, FretboardNote,
// Warning) is re-exported from index.ts; the rest are internal.

export interface FretboardNote {
  string: number   // 0 = high e, 5 = low E
  fret: number     // 0 = open, 15 = max in this app
}

export interface IntervalSlot {
  interval: string
  note: string | null
  altered: boolean
}

export interface ChordTones {
  root: string
  bass: string | null
  triad: IntervalSlot[]      // sus2, m3, 3, sus4, b5, 5, #5
  seventh: IntervalSlot[]    // b6, dim7, 6, 7, maj7
  extensions: IntervalSlot[] // b9, #9, 9, #11, 11, b13, 13
}

export interface ChordResult {
  name: string         // e.g. "Cm7", "C/E", "Cmaj9"
  primary: boolean
  warnings: string[]   // resolved English short-form text from chordWarnings
  chordTones: ChordTones // interval grid for THIS reading
}

export interface ChordAnalysis {
  chordNames: ChordResult[]   // up to 5
  chordTones: ChordTones
}

// CsParams — the structured object form returned by getChordInfo.
export interface CsParams {
  triadQ: '' | 'm' | 'dim' | 'aug'
  extNum: '' | '5' | '6' | 'b6' | '7' | 'maj7' | 'dim7' | '7,maj7'
  sus: '' | 'sus2' | 'sus4'
  tensionsObj: {
    b9: boolean; '9': boolean; '#9': boolean
    '11': boolean; '#11': boolean
    b5: boolean; '#5': boolean
    b13: boolean; '13': boolean
  }
  addsObj: {
    b9: boolean; '9': boolean; '#9': boolean
    '11': boolean; '#11': boolean
  }
  omit: '' | '3' | '5'
}

// CsArray — positional array form. Indices ARE order-sensitive.
export type CsArray = [
  triadQ: string,
  extNum: string,
  sus: string,
  tensions: string[],
  adds: string[] | '',
  omit: string,
]

// AbsoluteIntervals — booleans per absolute pitch class.
// Property iteration order matters: the warning rules' y[0..11] array depends
// on this exact key order.
export interface AbsoluteIntervals {
  pf1: boolean; mi2: boolean; ma2: boolean; mi3: boolean; ma3: boolean
  pf4: boolean; dm5: boolean; pf5: boolean; mi6: boolean; ma6: boolean
  mi7: boolean; ma7: boolean
}

// ChordInfo — return shape of getChordInfo.
export interface ChordInfo {
  absoluteIntervals: AbsoluteIntervals
  csParams: CsParams
  intervalNames: string[]    // length 12 — resolved label per semitone from root
  uniqueIntervals: string[]  // intervalNames mapped over the *input* halfSteps
  slashChord:
    | false
    | {
        absoluteIntervals: AbsoluteIntervals
        csParams: CsParams
        intervalNames: string[]
        uniqueIntervals: string[]
      }
}

// ChordSymbolResult — return shape of chordSymbol.
export interface ChordSymbolResult {
  csQuality: string
  csExt: string
  csSus: string
  csTensions: string
  csFormatted: string
  chSymArray: CsArray
  majToQuality: boolean
  susPostExt: boolean
  extInBrackets: boolean
  tensionsInBrackets: boolean
  specialChords: {
    m11b5no3: boolean
    dimb13: boolean
    dimb13no5: boolean
    susb9: boolean
    susb13: boolean
  }
}

// Variation — output of createVariations: one "this note is the root" reading.
export type Variation = ChordInfo & {
  uniqueHalfSteps: number[]
  rootToneFlat: string
  rootToneSharp: string
  intervals: string[]
  notesFlatRoot: string[]
  notesSharpRoot: string[]
  autoRootMode: 'flat' | 'sharp'
}

// Warning — one fired warning rule with resolved English text.
export interface Warning {
  id: string
  cat?:
    | 'omitted' | 'cluster' | 'double' | 'inversion' | 'fragment'
    | 'uncommon' | 'enharmonic' | 'dissonance' | ''
  short: string  // resolved English (NOT a key)
  long: string   // resolved English (NOT a key)
  assumedRoot?: string
}
