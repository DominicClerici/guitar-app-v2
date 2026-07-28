// chordWarnings — 25 rules over a chord's intervals that flag unusual or
// ambiguous voicings (clusters, conflicting tones, likely inversions, etc.).
// Each fired rule carries an id, a category, and resolved English text.

import type {
    ChordInfo,
    Warning
} from './types'

interface WarningText {
  short: string
  long: string
}

// User-facing English for each warning rule. `short` is the tag rendered in
// the chord-finder warnings list; `long` is the explanation surfaced when the
// user expands a warning. Voice is musician-to-musician and conversational.
//
// `cluster` uses {intA}/{intB}/{intC} placeholders that interpolate() resolves
// at runtime to the three adjacent interval labels that triggered the rule.
const WARNINGS_TEXT: Record<string, WarningText> = {
  no3: {
    short: 'No third',
    long: 'Nothing plays the 3rd — no m3, no major 3rd, no sus. The chord doesn\'t commit to major or minor.',
  },
  cluster: {
    short: 'Cluster: {intA}/{intB}/{intC}',
    long: '{intA}, {intB}, and {intC} land on three adjacent semitones — a cluster. Dense and dissonant by design.',
  },
  '5b5': {
    short: 'Has both 5 and b5',
    long: 'Perfect 5th and flat 5th are both voiced. One usually replaces the other — having both is a clash.',
  },
  '5#5': {
    short: 'Has both 5 and #5',
    long: 'Perfect 5th and sharp 5th are both voiced. One usually replaces the other — having both is a clash.',
  },
  'b5#5': {
    short: 'Has both b5 and #5',
    long: 'Both altered 5ths and no natural 5 — leans toward whole-tone territory.',
  },
  '7maj7': {
    short: 'Has both 7 and maj7',
    long: 'Dominant 7th and major 7th are a half-step apart and both in the chord. Pick one.',
  },
  '9b9': {
    short: 'Has both 9 and b9',
    long: 'Natural 9 and flat 9 sit a half-step apart. They tend to fight, not stack.',
  },
  '9#9': {
    short: 'Has both 9 and #9',
    long: 'Major 3rd plus a 9 plus a minor 3rd that reads as #9 — classic altered-dominant flavor, harsh outside that context.',
  },
  'b9#9': {
    short: 'Has both b9 and #9',
    long: 'Both altered 9ths stacked — heavy tension. Lives in jazz altered dominants.',
  },
  '13b13': {
    short: 'Has both 13 and b13',
    long: 'Natural 13 and flat 13 are a half-step apart. Usually one or the other.',
  },
  sus2b5: {
    short: 'Likely an inversion',
    long: 'sus2 with a b5 and no 3rd — try reading the 2nd as the root and the rest of the notes usually click.',
  },
  'sus2#5': {
    short: 'Likely an inversion',
    long: 'sus2 with a #5 and no 3rd — try reading the 7th as the root and the chord lines up cleaner.',
  },
  sus4b5: {
    short: 'Likely a fragment',
    long: 'sus4 with a b5 — looks like a fragment of a fuller chord rooted on a different note.',
  },
  'sus4#5': {
    short: 'Likely an inversion',
    long: 'sus4 with a #5 — try reading the 4th as the root and the chord usually makes more sense.',
  },
  maj7sus4: {
    short: 'maj7 with a sus4',
    long: 'Suspended 4th and a major 7th with no 3rd — unresolved and unusual, often standing in for a different chord.',
  },
  'm#5': {
    short: 'Likely an inversion',
    long: 'Minor 3rd with a #5 — usually this is a different chord with the b6 as its root.',
  },
  b6: {
    short: 'Likely an inversion',
    long: 'Major 3rd plus a b6 — that b6 is often the actual root, and you\'re hearing the chord from there.',
  },
  mb6: {
    short: 'Likely an inversion',
    long: 'Minor triad with an added b6 — usually the b6 is the real root and the rest is its upper structure.',
  },
  '6sus4': {
    short: 'Likely an inversion',
    long: 'sus4 with a 6 — same notes typically read as a chord rooted on the 4th.',
  },
  '6/9/11': {
    short: 'Likely an inversion',
    long: '6, 9, and 11 stacked with no 7 — usually the same notes rooted on the 4th.',
  },
  '6/11': {
    short: 'Likely an inversion',
    long: '6 and 11 with no 9 — usually the same notes rooted on the 4th.',
  },
  majorb5: {
    short: 'b5 might be a #11',
    long: 'Major triad with a b5 — that flat 5 is usually a #11 spelled from the wrong root.',
  },
  major11: {
    short: '11 clashes with the 3',
    long: 'The natural 11 sits a half-step above the major 3rd — they grind. Most players reach for #11 (Lydian) instead.',
  },
  m3b9: {
    short: 'b9 over a minor chord',
    long: 'A b9 stacked on a minor 3rd — Phrygian-flavored and tense. Often this is a different chord in disguise.',
  },
  addAlt: {
    short: 'Altered tone, no extension',
    long: 'A b9, #9, #11, or b13 with no 7th or extended tone underneath to alter — usually reads better as an add tone from a different root.',
  },
  OK: {
    short: 'Looks clean',
    long: 'No flags. This voicing reads as a standard chord.',
  },
}

function interpolate(text: string, params: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '')
}

function nAll(needles: string[], haystack: string[]): boolean {
  for (const needle of needles) if (!haystack.includes(needle)) return false
  return true
}

export function chordWarnings(info: ChordInfo): Warning[] {
  const b = info.uniqueIntervals
  const u = info.intervalNames
  const f = info.absoluteIntervals
  // Renamed locals to avoid shadowing — preserve source single-letter names
  // where they don't collide with TypeScript keywords or our own.
  const i = f.pf1, a = f.mi2, nMa2 = f.ma2
  const r = f.mi3, o = f.ma3, c = f.pf4
  const h = f.dm5, l = f.pf5, d = f.mi6
  const p = f.ma6, v = f.mi7, m = f.ma7

  // y[0..11]: f reordered into a 12-slot indexable array — the cluster
  // detector scans this with wraparound. KEY ORDER IS LOAD-BEARING.
  const y: boolean[] = []
  let x = 0
  for (const k of [
    'pf1', 'mi2', 'ma2', 'mi3', 'ma3', 'pf4',
    'dm5', 'pf5', 'mi6', 'ma6', 'mi7', 'ma7',
  ] as const) {
    y[x++] = f[k]
  }

  const out: Warning[] = []
  function push(rule: string, fields: Partial<Warning>, params?: Record<string, string>) {
    const t = WARNINGS_TEXT[rule] ?? { short: '', long: '' }
    out.push({
      id: rule,
      ...fields,
      short: params ? interpolate(t.short, params) : t.short,
      long: params ? interpolate(t.long, params) : t.long,
    } as Warning)
  }

  // 1. no3 — pf1 present, no triad-defining tone (no m3, ma3, ma2, pf4)
  if (i && !r && !o && !nMa2 && !c) {
    push('no3', { cat: 'omitted' })
  }
  // 2. cluster — three consecutive semitones (sliding window with wraparound)
  for (let s = 0; s < 12; s += 1) {
    let L = s + 1
    let C = s + 2
    if (L > 11) L -= 12
    if (C > 11) C -= 12
    if (y[s] && y[L] && y[C]) {
      push('cluster', { cat: 'cluster' }, { intA: u[s], intB: u[L], intC: u[C] })
    }
  }
  // 3. 5b5 — pf5 + dm5 with intervalNames[6] = "b5"
  if (l && h && u[6] === 'b5') push('5b5', { cat: 'double' })
  // 4. 5#5 — pf5 + mi6 with intervalNames[8] = "#5"
  if (l && d && u[8] === '#5') push('5#5', { cat: 'double' })
  // 5. b5#5 — both b5 and #5 in unique intervals
  if (nAll(['b5', '#5'], b)) push('b5#5', { cat: 'double' })
  // 6. 7maj7 — both mi7 and ma7
  if (v && m) push('7maj7', { cat: 'double' })
  // 7. 9b9 — ma2 and mi2 both present
  if (nMa2 && a) push('9b9', { cat: 'double' })
  // 8. 9#9 — ma2 + both 3rds
  if (nMa2 && r && o) push('9#9', { cat: 'double' })
  // 9. b9#9 — both in unique intervals
  if (nAll(['b9', '#9'], b)) push('b9#9', { cat: 'double' })
  // 10. 13b13 — both
  if (nAll(['b13', '13'], b)) push('13b13', { cat: 'double' })
  // 11. sus2b5
  if (nMa2 && u[2] === 'sus2' && h && u[6] === 'b5') {
    push('sus2b5', { cat: 'inversion', assumedRoot: '2' })
  }
  // 12. sus2#5 (no cat in source)
  if (nMa2 && u[2] === 'sus2' && d && u[8] === '#5') {
    push('sus2#5', { assumedRoot: '7' })
  }
  // 13. sus4b5
  if (c && u[5] === 'sus4' && h && u[6] === 'b5') {
    push('sus4b5', { cat: 'fragment', assumedRoot: 'b6,6,9,m3' })
  }
  // 14. sus4#5
  if (c && u[5] === 'sus4' && d && u[8] === '#5') {
    push('sus4#5', { cat: 'inversion', assumedRoot: '4' })
  }
  // 15. maj7sus4 (cat: '' in source — empty string)
  if (c && u[5] === 'sus4' && m) {
    push('maj7sus4', { cat: '', assumedRoot: '' })
  }
  // 16. m#5
  if (r && u[3] === 'm3' && d && u[8] === '#5') {
    push('m#5', { cat: 'uncommon', assumedRoot: 'b6' })
  }
  // 17. b6
  if (nAll(['3', 'b6'], b)) push('b6', { cat: 'inversion', assumedRoot: 'b6' })
  // 18. mb6
  if (nAll(['m3', 'b6', '5'], b)) push('mb6', { cat: 'inversion', assumedRoot: 'mb6' })
  // 19. 6sus4
  if (c && u[5] === 'sus4' && p && u[9] === '6') {
    push('6sus4', { cat: 'inversion', assumedRoot: '4' })
  }
  // 20–21. 6/9/11 vs 6/11 (else-if'd in source — important!)
  if (nAll(['6', '9', '11'], b)) {
    push('6/9/11', { cat: 'inversion', assumedRoot: '4' })
  } else if (nAll(['6', '11'], b)) {
    push('6/11', { cat: 'inversion', assumedRoot: '4' })
  }
  // 22. majorb5
  if (o && h && u[6] === 'b5') {
    push('majorb5', { cat: 'enharmonic', assumedRoot: '' })
  }
  // 23. major11 — must NOT contain "6"
  if (nAll(['3', '11'], b) && !nAll(['6'], b)) push('major11', { cat: 'dissonance' })
  // 24. m3b9
  if (nAll(['m3', 'b9'], b)) push('m3b9', { cat: 'dissonance' })
  // 25. addAlt — no extension number AND any altered tension present
  if (
    info.csParams.extNum === '' &&
    (b.indexOf('b9') > -1 || b.indexOf('#9') > -1 ||
     b.indexOf('#11') > -1 || b.indexOf('b13') > -1)
  ) {
    push('addAlt', {})
  }

  return out
}
