// Layer C — symbol formatting. Takes a root, a positional CsArray, and an
// optional bass, and produces the printed chord name (e.g. "Cm7(b5,11)",
// "D/F#"). See ANALYSIS.md for the formatting rules.
//
// Formatting is governed by these fixed settings (the engine has no
// user-facing knobs):
//   - triad quality uses letters: m / dim / aug (never the −/°/+ icons)
//   - tensions are wrapped in (...)
//   - abbreviated forms: C7add9 → C9, sus4 → sus, etc.
//   - 6/9, b6/9 rendered with a slash
//   - plain strings, never HTML
import type { ChordSymbolResult, CsArray, CsParams } from './types';

const SYNTAX = {
  abbr: true,
  sixSlash911: true,
  flatSixSlash911: true,
  spans: false,
} as const;

// Tension grouping order in the printed symbol.
const TENSIONS_ORDER = ['b5', '#5', 'b6', '9', '11', '13', 'b9', '#9', '#11', 'b13'] as const;

// "add" grouping order in the printed symbol.
const ADDS_ORDER = ['b9', '9', '#9', '11', '#11'] as const;

// Identity. The original engine substituted accidental glyphs here; we render
// plain ASCII, so this is a no-op kept at the call sites for clarity.
function replaceAcc(t: string): string {
  return t;
}

export function chordSymbolObjectToArray(t: CsParams): CsArray {
  const e = TENSIONS_ORDER;
  const s: string[] = [];
  if (t.tensionsObj) {
    for (let o = 0, i = e.length; o < i; o += 1) {
      if ((t.tensionsObj as Record<string, boolean>)[e[o]] === true) s.push(e[o]);
    }
  }
  const a = ADDS_ORDER;
  const n: string[] = [];
  if (t.addsObj) {
    for (let r = 0, h = a.length; r < h; r += 1) {
      if ((t.addsObj as Record<string, boolean>)[a[r]] === true) n.push('add' + a[r]);
    }
  }
  const l: [string, string, string, string[], string[] | '', string] = ['', '', '', [], '', ''];
  l[0] = t.triadQ ? t.triadQ : '';
  l[1] = t.extNum ? t.extNum : '';
  l[2] = t.sus ? t.sus : '';
  l[3] = t.tensionsObj ? s : [];
  // Collapse an empty adds list to '' (rather than an empty array) so the
  // positional CsArray has a stable shape downstream.
  l[4] = t.addsObj ? (n.length === 0 ? '' : n) : '';
  l[5] = t.omit ? t.omit : '';
  return l as CsArray;
}

export function chordSymbol(
  args: [root: string, csArray?: CsArray, bass?: string | string[]],
): ChordSymbolResult {
  const t = args;
  // Step 1 — initialize result accumulators.
  const s: ChordSymbolResult = {
    csQuality: '',
    csExt: '',
    csSus: '',
    csTensions: '',
    csFormatted: '',
    chSymArray: ['', '', '', [], '', ''] as CsArray,
    majToQuality: false,
    susPostExt: false,
    extInBrackets: false,
    tensionsInBrackets: false,
    specialChords: {
      m11b5no3: false,
      dimb13: false,
      dimb13no5: false,
      susb9: false,
      susb13: false,
    },
  };

  // Step 2 — clone syntax. (No overrides arg in our adaptation; SYNTAX is read directly.)
  const o = SYNTAX;

  let a = '';
  // n is a deep-copy at csArray[3] and csArray[4] per source line 6648.
  const n: [string, string, string, string[], string[] | '', string] = ['', '', '', [], '', ''];
  let r: string = '';

  // Step 3 — parse args, deep-copy tensions/adds.
  if (t[0] && '' !== t[0]) a = t[0];
  // Step 4 — replaceAcc on root.
  a = replaceAcc(a);
  if (t[1]) {
    for (let f = 0; f < t[1].length; f += 1) {
      // Deep-copy slots 3 and 4 (tensions & adds) per source line 6648.
      const v = t[1][f];
      if (f === 3 || f === 4) {
        n[f] = Array.isArray(v) ? (v.slice(0) as string[]) : (v as never);
      } else {
        (n as unknown as unknown[])[f] = v;
      }
    }
  }

  // Step 4 — replaceAcc on bass (handle string and string[] forms).
  if (t[2] && '' !== t[2]) {
    if (typeof t[2] === 'object') r = (t[2] as string[])[0];
    else if (typeof t[2] === 'string') r = t[2];
    r = replaceAcc(r);
  }

  // getChordInfo encodes "holds both sevenths" as the extension "7,maj7", which
  // is a pair of labels rather than a printable extension — left alone it reaches
  // the screen verbatim ("D7,maj7/C"). Demote the major 7th to a tension so the
  // rest of the pipeline sees an ordinary dominant: the abbreviation pass can
  // still fold a 9/11/13 into the extension, and the bracketing puts the leftover
  // maj7 where every other tension goes (C9(maj7)).
  if ('7,maj7' === n[1]) {
    n[1] = '7';
    (n[3] as string[]).push('maj7');
  }

  // Step 5 — special-chord detection (m11b5no3).
  if (
    n[5] &&
    '3' === n[5] &&
    'm' === n[0] &&
    '7' === n[1] &&
    (n[3] as string[]).indexOf('11') > -1 &&
    (n[3] as string[]).indexOf('b5') > -1
  ) {
    n[5] = '';
    s.specialChords.m11b5no3 = true;
  }

  // Step 5 — dimb13 / dimb13no5.
  if (n[5] && '5' === n[5]) {
    if (
      'dim' === n[0] &&
      'dim7' === n[1] &&
      (n[3] as string[]).length === 1 &&
      'b13' === (n[3] as string[])[0]
    ) {
      if (o.abbr === true) n[1] = '';
      n[5] = '';
      s.specialChords.dimb13no5 = true;
    }
  } else if (
    'dim' === n[0] &&
    'dim7' === n[1] &&
    (n[3] as string[]).length === 1 &&
    'b13' === (n[3] as string[])[0]
  ) {
    if (o.abbr === true) n[1] = '';
    s.specialChords.dimb13 = true;
  }

  // Step 5 — susb9 / susb13.
  if (
    n[3] &&
    '7' === n[1] &&
    'sus4' === n[2] &&
    (n[3] as string[]).length === 1 &&
    ('b9' === (n[3] as string[])[0] || 'b13' === (n[3] as string[])[0])
  ) {
    if (o.abbr === true) n[1] = '';
    if ('b9' === (n[3] as string[])[0]) s.specialChords.susb9 = true;
    else if ('b13' === (n[3] as string[])[0]) s.specialChords.susb13 = true;
  }

  // Step 6 — pull short locals.
  let h = '';
  let l = '';
  let c = '';
  let d = '';
  let p = '';
  if (n.length > 0) h = n[0];
  if (n.length > 2 && '' !== n[2]) c = n[2];
  // Step 7 — dim/dim7 collapse.
  if (n.length > 1) {
    l = n[1];
    if ('dim' === n[0] && 'dim7' === n[1]) {
      h = 'dim';
      l = '7';
    }
  }

  const u = ['9', '11', '13'];
  if (n[3]) {
    // Step 8 — 6/9, 6/11, 6/13 routing.
    if (('b6' === l && o.flatSixSlash911 === true) || ('6' === l && o.sixSlash911 === true)) {
      for (let f = 0; f < 3; f++) {
        if ((n[3] as string[]).indexOf(u[f]) > -1) {
          l += '/' + u[f];
          (n[3] as string[]).splice((n[3] as string[]).indexOf(u[f]), 1);
        }
      }
    } else if ('b6' === l && (o.flatSixSlash911 as boolean) === false) {
      for (let f = 0; f < 3; f++) {
        if ((n[3] as string[]).indexOf(u[f]) > -1) {
          l += ',' + u[f];
          (n[3] as string[]).splice((n[3] as string[]).indexOf(u[f]), 1);
        }
      }
    }

    // Step 9 — abbr collapses (7/maj7/dim7 + 9/11/13 → 9/11/13). The number
    // takes the highest extension present and swallows the 9 underneath it, but
    // never a natural 11: "13" is read as 1-3-5-7-9-13, so an 11 that really is
    // voiced has to stay printed or C13 names both C E G Bb D A and C E G Bb F A.
    if (o.abbr === true && ('7' === l || 'maj7' === l || 'dim7' === l)) {
      const tensions = n[3] as string[];
      let b = '7';
      for (let f = 0; f < 3; f++) {
        if (tensions.indexOf(u[f]) > -1) b = u[f];
      }
      if ('7' !== b) {
        for (const absorbed of b === '9' ? ['9'] : ['9', b]) {
          const at = tensions.indexOf(absorbed);
          if (at > -1) tensions.splice(at, 1);
        }
        l = l.replace('7', b);
      }
    }

    // Step 8 — comma-joined fallback when l is still "b6".
    if ('b6' === l) {
      for (let f = 0; f < 3; f++) {
        if ((n[3] as string[]).indexOf(u[f]) > -1) {
          l += ',' + u[f];
          (n[3] as string[]).splice((n[3] as string[]).indexOf(u[f]), 1);
        }
      }
    }
  }

  // Step 10 — append tensions.
  if (n[3] && (n[3] as string[]).length > 0) d += (n[3] as string[]).join(',');

  // Step 9 — abbr extras (dim7 cleared, sus4 → sus).
  if (o.abbr === true) {
    if (n[1] && 'dim7' === n[1]) n[1] = '';
    if ('sus4' === n[2]) c = 'sus';
  }

  // Omit local.
  if (n[5] && '' !== n[5]) p = n[5];

  // Step 12 — susPostExt flag. The sus follows the extension number for every
  // extension that reads as a stack over the root: C7sus, C9sus, C13sus,
  // C6/9sus, Cmaj9sus. This runs *after* the abbreviation pass has rewritten
  // "7" as "9"/"11"/"13", so it tests the shape of the extension rather than
  // listing tokens — a token list is what left C9sus4 printing as "Csus9".
  // b6 is the exception: "Cb6sus" would read as a Cb chord.
  if ('' !== c && '' !== l && '5' !== l && l.indexOf('b6') < 0) {
    s.susPostExt = true;
  }

  // Step 11 — adds + omit.
  if (n[4]) {
    if ((n[4] as string[]).length > 0) {
      // Source: n[3] != [] && n[3].length > 0 → comma separator.
      if (n[3] !== ([] as unknown) && (n[3] as string[]).length > 0) d += ',';
      d += (n[4] as string[]).join(',');
    }
    if ('' !== p) {
      if (
        (n[3] as string[]).length > 0 ||
        ((n[4] as string[]).length > 0 && (n[4] as unknown) !== ([] as unknown))
      ) {
        d += ',';
      }
      d += 'no' + p;
    }
  }

  // Step 13 — extInBrackets flag.
  if (l.indexOf('b6') > -1 && '' === h && '' === c) s.extInBrackets = true;
  if (o.spans === false && n.length > 1 && 'm' === n[0] && 'maj7' === n[1]) {
    s.extInBrackets = true;
  }

  // Step 14 — tensionsInBrackets flag.
  // Tensions are always bracketed (the engine has no auto-relax mode that would
  // unbracket single-tension chords like "7b5" or "add9").
  if ('' !== d) {
    s.tensionsInBrackets = true;
    // abbr-mode special chords skip brackets.
    if (
      o.abbr === true &&
      (s.specialChords.dimb13 === true ||
        s.specialChords.dimb13no5 === true ||
        s.specialChords.m11b5no3 === true ||
        s.specialChords.susb9 === true ||
        s.specialChords.susb13 === true)
    ) {
      s.tensionsInBrackets = false;
    }
  }

  // Step 16 — stash flags + bracketing.
  s.csQuality = h;
  s.csExt = l;
  s.csSus = c;
  s.csTensions = d;
  if (s.extInBrackets === true && s.tensionsInBrackets === true) {
    l = '(' + l;
    d = ',' + d + ')';
  } else if (s.extInBrackets === true && s.tensionsInBrackets === false) {
    l = '(' + l + ')';
  } else if (s.tensionsInBrackets === true && s.extInBrackets === false) {
    d = '(' + d + ')';
  }

  // Step 17 — accidental pass on the extension/tension fragments.
  l = replaceAcc(l);
  d = replaceAcc(d);

  // Step 18 — compose final string.
  let g = '';
  g = a;
  if (s.susPostExt === true) g += h + l + c + d;
  else g += h + c + l + d;
  if (r) g += '/' + r;

  s.csFormatted = g;
  s.chSymArray = n as CsArray;
  return s;
}
