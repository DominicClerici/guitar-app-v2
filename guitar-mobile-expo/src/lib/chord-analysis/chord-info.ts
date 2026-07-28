// Layer B — chord identification (the algorithmic core). Given an array of
// half-step offsets relative to a root (always including 0), it decides triad
// quality, extension, sus, tensions/adds, omit, and the resolved interval
// label per semitone. Read carefully before editing.
//
// Single-letter locals track absolute intervals — keep this legend handy:
//   e=pf1, s=mi2/b9, o=ma2/9/sus2, i=mi3, a=ma3, n=pf4/sus4/11,
//   r=dm5/b5/#11, h=pf5, l=mi6/#5/b13/b6, d=ma6/13/dim7,
//   c=mi7, p=ma7

import type { AbsoluteIntervals, ChordInfo, CsParams } from './types';

export function getChordInfo(t: number[]): ChordInfo {
  let e = false, s = false, o = false, i = false, a = false, n = false
  let r = false, h = false, l = false, d = false, c = false, p = false
  const f: number[] = t.slice()

  function u(): void {
    e = false; s = false; o = false; i = false; a = false; n = false
    r = false; h = false; l = false; d = false; c = false; p = false
    for (let k = 0, len = f.length; k < len; k += 1) {
      if (f[k] === 0) e = true
      else if (f[k] === 1) s = true
      else if (f[k] === 2) o = true
      else if (f[k] === 3) i = true
      else if (f[k] === 4) a = true
      else if (f[k] === 5) n = true
      else if (f[k] === 6) r = true
      else if (f[k] === 7) h = true
      else if (f[k] === 8) l = true
      else if (f[k] === 9) d = true
      else if (f[k] === 10) c = true
      else if (f[k] === 11) p = true
    }
  }
  u()

  let b: CsParams['triadQ'] = ''
  let g: CsParams['extNum'] = ''
  let v: CsParams['sus'] = ''
  let m: CsParams['tensionsObj'] = {
    b9: false, '9': false, '#9': false,
    '11': false, '#11': false,
    b5: false, '#5': false,
    b13: false, '13': false,
  }
  let x: CsParams['addsObj'] = {
    b9: false, '9': false, '#9': false,
    '11': false, '#11': false,
  }
  let y: CsParams['omit'] = ''

  function S(): CsParams {
    b = ''
    g = ''
    v = ''
    m = {
      b9: false, '9': false, '#9': false,
      '11': false, '#11': false,
      b5: false, '#5': false,
      b13: false, '13': false,
    }
    x = {
      b9: false, '9': false, '#9': false,
      '11': false, '#11': false,
    }
    y = ''

    // triad quality
    if (i && !a) {
      b = (!r || h || c || p) ? 'm' : 'dim'
    } else if ((l && a && !h && !c && !p) || (l && f.length <= 2)) {
      b = 'aug'
    }

    // sus
    if (!i && !a) {
      if (n) v = 'sus4'
      else if (o && !n) v = 'sus2'
    }

    // extension number — note this is a single ternary cascade in the source:
    //   !h || s || o || i || a || n || r || l || d || c || p
    //     ? (c && !p ? "7" : p && !c ? "maj7" : c && p ? "7,maj7"
    //        : d ? (b == "dim" ? "dim7" : "6")
    //        : (l && b != "aug" ? "b6" : ""))
    //     : "5"
    if (!h || s || o || i || a || n || r || l || d || c || p) {
      if (c && !p) g = '7'
      else if (p && !c) g = 'maj7'
      else if (c && p) g = '7,maj7'
      else if (d) g = (b === 'dim') ? 'dim7' : '6'
      else if (l && b !== 'aug') g = 'b6'
    } else {
      g = '5'
    }

    let tFlag = false
    if (g.indexOf('7') < 0 && g.indexOf('6') < 0) tFlag = true

    // tensions
    if (s) m.b9 = true
    if (o && v !== 'sus2') m['9'] = true
    if (i && a) m['#9'] = true
    if (n && v !== 'sus4') m['11'] = true
    if (r && b !== 'dim') {
      if (h) m['#11'] = true
      else if ((!a && !p && v !== 'sus2') || n) m.b5 = true
      else m['#11'] = true
    }
    if (l && b !== 'aug' && g !== 'b6') {
      if (h || (c && !d) || b === 'dim') m.b13 = true
      else m['#5'] = true
    }
    if (d && (c || p)) m['13'] = true

    if (tFlag) {
      if (o && v !== 'sus2') { x['9'] = true; m['9'] = false }
      if (n && v !== 'sus4') { x['11'] = true; m['11'] = false }
      const movable: ('b9' | '#9' | '#11')[] = ['b9', '#9', '#11']
      for (let k = 0, len = movable.length; k < len; k += 1) {
        const key = movable[k]
        if (m[key] === true) {
          m[key] = false
          x[key] = true
        }
      }
    }

    // omit
    if (f.length > 1) {
      if (!(o || i || a || n || g === '5')) y = '3'
    }

    // m11 special override
    if (e && !o && !i && !a && n && r && !h && !l && !d && c && !p) {
      v = ''
      b = 'm'
      m['11'] = true
      y = '3'
    }

    // dim7+b13 special override
    if (e && !o && i && !a && !n && !r && !h && l && d && !c && !p) {
      b = 'dim'
      g = 'dim7'
      m.b13 = true
      m['#5'] = false
      y = '5'
    }

    return {
      triadQ: b,
      extNum: g,
      sus: v,
      tensionsObj: m,
      addsObj: x,
      omit: y,
    }
  }

  function w(): string[] {
    const out: string[] = []
    out[0] = '1'
    out[1] = 'b9'
    out[2] = v === 'sus2' ? 'sus2' : '9'
    out[3] = a ? '#9' : 'm3'
    out[4] = '3'
    out[5] = v === 'sus4' ? 'sus4' : '11'
    out[6] = (m['#11'] === true || x['#11'] === true) ? '#11' : 'b5'
    out[7] = '5'
    if (g === 'b6') out[8] = 'b6'
    else if (m.b13 === true) out[8] = 'b13'
    else out[8] = '#5'
    if (m['13'] === true) out[9] = '13'
    else if (g === '6') out[9] = '6'
    else out[9] = 'dim7'
    out[10] = '7'
    out[11] = 'maj7'
    return out
  }

  function C(intervalNames: string[]): string[] {
    const out: string[] = []
    for (let k = 0, len = f.length; k < len; k += 1) {
      out.push(intervalNames[f[k]])
    }
    return out
  }

  const I: ChordInfo = {
    absoluteIntervals: {
      pf1: e, mi2: s, ma2: o, mi3: i, ma3: a,
      pf4: n, dm5: r, pf5: h, mi6: l, ma6: d,
      mi7: c, ma7: p,
    },
    csParams: { } as CsParams,
    intervalNames: [],
    uniqueIntervals: [],
    slashChord: false,
  }
  I.csParams = S()
  I.intervalNames = w()
  I.uniqueIntervals = C(I.intervalNames)

  if (f[0] !== 0) {
    const F = f[0]
    const T: Record<string, number> = {
      b9: 1, '9': 2, '#9': 3, '11': 5, '#11': 6,
      b6: 8, b13: 8, '6': 9, '13': 9,
    }
    for (const k in T) {
      if (F === T[k] && I.intervalNames[T[k]] === k) f.shift()
    }
    u()
    const slashAbs: AbsoluteIntervals = {
      pf1: e, mi2: s, ma2: o, mi3: i, ma3: a,
      pf4: n, dm5: r, pf5: h, mi6: l, ma6: d,
      mi7: c, ma7: p,
    }
    const slashCsParams = S()
    const slashIntervalNames = w()
    const slashUniqueIntervals = C(slashIntervalNames)
    I.slashChord = {
      absoluteIntervals: slashAbs,
      csParams: slashCsParams,
      intervalNames: slashIntervalNames,
      uniqueIntervals: slashUniqueIntervals,
    }
  } else {
    I.slashChord = false
  }
  return I
}
