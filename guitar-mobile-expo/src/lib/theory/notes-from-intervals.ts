// Layer D (spelling) — interval labels → spelled note names. Looks each
// interval up in the mixolydian skeleton for the root, applying single
// accidental shifts (h lowers, l raises). This is the only place that decides
// whether a pitch class shows as "F#" or "Gb".

import {
    mixolydian,
    notesEnhFlat,
    notesEnhSharp,
    notesFlat,
    notesSharp
} from './constants'

/**
 * Lower mixolydian degree `n` by one accidental.
 *   - "##" or "#" → strip one trailing accidental.
 *   - "bb" → wrap to the previous degree (0 wraps to 6) to avoid "bbb".
 *   - otherwise → append a "b".
 */
function h(root: string, n: number): string {
  const mix = mixolydian[root]
  if (!mix) throw new Error(`getNotesFromIntervals: unknown root "${root}"`)
  const o = mix[n]
  const s = n === 0 ? 6 : n - 1
  const i = o.length
  if (o.indexOf('##') > -1 || o.indexOf('#') > -1) {
    return o.substr(0, i - 1)
  }
  if (o.indexOf('bb') > -1) {
    return mix[s]
  }
  return o + 'b'
}

/**
 * Raise mixolydian degree `n` by one accidental — symmetric of h():
 *   - "bb" or "b" → strip one trailing flat.
 *   - "##" → wrap to the next degree (6 wraps to 0) and append "#".
 *   - otherwise → append a "#".
 */
function l(root: string, n: number): string {
  const mix = mixolydian[root]
  if (!mix) throw new Error(`getNotesFromIntervals: unknown root "${root}"`)
  const o = mix[n]
  const s = n === 6 ? 0 : n + 1
  const i = o.length
  if (o.indexOf('bb') > -1 || o.indexOf('b') > -1) {
    return o.substr(0, i - 1)
  }
  if (o.indexOf('##') > -1) {
    return mix[s] + '#'
  }
  return o + '#'
}

export function getNotesFromIntervals(
  root: string,
  intervals: string[],
  correct: boolean,
): string[] {
  const out: string[] = []
  const mix = mixolydian[root]
  if (!mix) throw new Error(`getNotesFromIntervals: unknown root "${root}"`)

  for (let idx = 0; idx < intervals.length; idx += 1) {
    const n = intervals[idx]
    let note: string
    switch (n) {
      case '1':
        note = mix[0]
        break
      case '9':
      case '2':
      case 'sus2':
        note = mix[1]
        break
      case '3':
        note = mix[2]
        break
      case '11':
      case '4':
      case 'sus4':
        note = mix[3]
        break
      case '5':
        note = mix[4]
        break
      case '13':
      case '6':
        note = mix[5]
        break
      case '7':
        note = mix[6]
        break
      case '#1':
        note = l(root, 0)
        break
      case '#9':
      case '#2':
        note = l(root, 1)
        break
      case '#11':
      case '#4':
        note = l(root, 3)
        break
      case '#5':
        note = l(root, 4)
        break
      case '#6':
        note = l(root, 5)
        break
      case 'maj7':
      case 'j7':
      case 'ma7':
        note = l(root, 6)
        break
      case 'b1':
        note = h(root, 0)
        break
      case 'b9':
      case 'b2':
        note = h(root, 1)
        break
      case 'b3':
      case '-3':
      case 'm3':
        note = h(root, 2)
        break
      case 'b4':
        note = h(root, 3)
        break
      case 'b5':
        note = h(root, 4)
        break
      case 'b6':
      case 'b13':
        note = h(root, 5)
        break
      case 'b7':
      case '°7':
      case 'dim7':
        note = h(root, 6)
        break
      default:
        note = 'x'
    }
    out.push(note)
  }

  // Post-process: when `correct` is false, collapse extreme enharmonics
  // (B## → C#, Cb → B, Bbb → A, etc.) to their common spellings.
  if (!correct) {
    for (let idx = 0; idx < out.length; idx += 1) {
      const r = notesEnhSharp.indexOf(out[idx] as (typeof notesEnhSharp)[number])
      if (r > -1) {
        out[idx] = notesSharp[r]
        continue
      }
      const r2 = notesEnhFlat.indexOf(out[idx] as (typeof notesEnhFlat)[number])
      if (r2 > -1) out[idx] = notesFlat[r2]
    }
  }

  return out
}
