// Invariant check for the guitar voicing engine. There is no test runner in this
// project, so this is the verification step for src/lib/guitar-voicings. Run it
// after touching the generator, the scorer or the pin list:
//
//   node --import ./scripts/ts-resolver.mjs scripts/verify-guitar-voicings.ts
//
// Pass --dump "Cmaj7" to print a chord's shapes as ASCII boxes. That is how the
// pin list gets authored: look at what the generator ranks first, and pin only
// where it disagrees with the shape a player would actually reach for.

import { buildChord, CHORD_TYPES, parseChordSymbol, ROOTS } from '../src/lib/chord-library';
import {
  chartFor,
  chordShapes,
  generateVoicings,
  pinKey,
  pinnedFor,
  type Voicing,
} from '../src/lib/guitar-voicings';
import { MAX_SPAN } from '../src/lib/guitar-voicings/fingering';
import { MUD_RULES } from '../src/lib/guitar-voicings/generate';
import { PINNED_SHAPES } from '../src/lib/guitar-voicings/pins';
import { degreeSemitones, midiAt, pitchClassAt, noteToSemitone } from '../src/lib/theory';

const failures: string[] = [];

function check(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

// ── Dump mode ──────────────────────────────────────────────────────────────
const dumpIndex = process.argv.indexOf('--dump');
if (dumpIndex >= 0) {
  const symbol = process.argv[dumpIndex + 1];
  const parsed = symbol ? parseChordSymbol(symbol) : null;
  if (!parsed) {
    console.error(`Not a chord symbol: ${symbol ?? '(missing)'}`);
    process.exit(1);
    throw new Error('unreachable');
  }

  const chord = buildChord(parsed.root, parsed.type);
  const shapes = chordShapes(chord);

  console.log(`\n${chord.symbol} — ${chord.type.name}`);
  console.log(chord.tones.map((t) => `${t.degree}:${t.note}`).join('  '));
  console.log(`${shapes.total} root-position shapes, ${shapes.inversions.length} inversions\n`);

  for (const group of shapes.all) {
    console.log(`── ${group.region} ─────────────────────────`);
    for (const voicing of group.voicings) console.log(render(voicing));
  }
  process.exit(0);
}

/** An ASCII chord box, low E on the left, for eyeballing shapes in a terminal. */
function render(voicing: Voicing): string {
  const chart = voicing.id;
  const fingers = [...voicing.fingers]
    .reverse()
    .map((finger) => (finger === null ? '-' : finger === 0 ? 'o' : String(finger)))
    .join(' ');
  const degrees = [...voicing.degrees]
    .reverse()
    .map((degree) => (degree ?? '·').padStart(4))
    .join('');

  const tags = [
    voicing.difficulty,
    voicing.position > 0 ? `${voicing.position}fr` : 'open',
    voicing.barre ? `barre@${voicing.barre.fret}` : '',
    voicing.omitted.length ? `no ${voicing.omitted.join('/')}` : '',
    voicing.slashSymbol ?? '',
  ].filter(Boolean);

  return `  ${chart.padEnd(14)} ${fingers.padEnd(12)} ${degrees}   ${tags.join(' · ')}\n`;
}

// ── Every chord, every root ────────────────────────────────────────────────
let chordCount = 0;
let voicingCount = 0;
const chordsWithNoShapes: string[] = [];

for (const root of ROOTS) {
  for (const type of CHORD_TYPES) {
    const chord = buildChord(root, type);
    chordCount += 1;

    const rooted = generateVoicings(chord);
    const inversions = generateVoicings(chord, { inversions: true });
    voicingCount += rooted.length + inversions.length;

    if (rooted.length === 0) chordsWithNoShapes.push(chord.symbol);

    const chordPitchClasses = new Set(chord.tones.map((tone) => tone.pitchClass));
    const essentialFloor = type.degrees.length - type.dropOrder.length;

    for (const voicing of [...rooted, ...inversions]) {
      const where = `${chord.symbol} [${voicing.id}]`;

      // ── Spelling: every sounding string belongs to the chord ────────────
      const sounding: number[] = [];
      voicing.frets.forEach((fret, string) => {
        if (fret === null) return;
        sounding.push(string);
        check(
          chordPitchClasses.has(pitchClassAt(string, fret)),
          `${where}: string ${string} fret ${fret} is not a chord tone`,
        );
        check(
          voicing.degrees[string] !== null && voicing.notes[string] !== null,
          `${where}: string ${string} sounds but has no degree or note`,
        );
      });

      // The degree recorded per string must be the pitch actually sounding.
      voicing.frets.forEach((fret, string) => {
        const degree = voicing.degrees[string];
        if (fret === null || degree === null) return;
        const expected = (noteToSemitone(chord.root) + degreeSemitones(degree)) % 12;
        check(
          pitchClassAt(string, fret) === expected,
          `${where}: string ${string} is labelled ${degree} but does not sound it`,
        );
      });

      check(sounding.length >= (type.family === 'power' ? 2 : 3), `${where}: too few voices`);

      // ── Identity: the name is still true ────────────────────────────────
      const present = new Set(voicing.degrees.filter((degree) => degree !== null));
      check(present.has('1'), `${where}: no root`);
      check(present.size >= essentialFloor, `${where}: dropped past the essential tones`);
      for (const degree of type.degrees) {
        const droppable = type.dropOrder.includes(degree);
        check(
          present.has(degree) || droppable,
          `${where}: missing ${degree}, which ${type.id} may not drop`,
        );
      }
      check(
        voicing.omitted.every((degree) => type.dropOrder.includes(degree)),
        `${where}: omitted a tone that is not droppable`,
      );
      check(
        voicing.omitted.length === type.degrees.length - present.size,
        `${where}: omitted list disagrees with the degrees sounding`,
      );

      // ── Bass and slash labelling ────────────────────────────────────────
      // Lowest pitch, not lowest string: an eighth-fret low E sounds above an
      // open A, and the bass note is what you hear, not where your hand is.
      const lowest = sounding.reduce((low, string) =>
        midiAt(string, voicing.frets[string]!) < midiAt(low, voicing.frets[low]!) ? string : low,
      );
      const bottomString = sounding[sounding.length - 1];
      check(
        voicing.degrees[lowest] === voicing.bass,
        `${where}: declares bass ${voicing.bass} but the lowest note sounds ${voicing.degrees[lowest]}`,
      );
      check(
        (voicing.bass === '1') === (voicing.slashSymbol === undefined),
        `${where}: slash label disagrees with the bass degree`,
      );
      if (voicing.slashSymbol) {
        check(
          voicing.slashSymbol === `${chord.symbol}/${voicing.notes[lowest]}`,
          `${where}: slash symbol "${voicing.slashSymbol}" does not name its bass note`,
        );
      }

      // ── Geometry ────────────────────────────────────────────────────────
      const fingered = voicing.frets.filter((f): f is number => f !== null && f > 0);
      if (fingered.length > 0) {
        check(
          voicing.position === Math.min(...fingered),
          `${where}: position ${voicing.position} is not the lowest fingered fret`,
        );
        check(
          voicing.span === Math.max(...fingered) - Math.min(...fingered) + 1,
          `${where}: span ${voicing.span} does not match the frets`,
        );
      }
      check(voicing.span <= MAX_SPAN, `${where}: span ${voicing.span} is beyond reach`);

      const interior = voicing.frets
        .slice(sounding[0], bottomString + 1)
        .filter((fret) => fret === null).length;
      check(interior <= 1, `${where}: ${interior} muted strings inside the shape`);

      // ── Fingering ───────────────────────────────────────────────────────
      const used = new Set(voicing.fingers.filter((finger) => finger !== null && finger > 0));
      check(used.size <= 4, `${where}: needs ${used.size} fingers`);
      voicing.frets.forEach((fret, string) => {
        const finger = voicing.fingers[string];
        if (fret === null) {
          check(finger === null, `${where}: string ${string} is muted but has a finger`);
        } else if (fret === 0) {
          check(finger === 0, `${where}: open string ${string} is fingered`);
        } else {
          check(
            finger !== null && finger > 0,
            `${where}: string ${string} is fretted but has no finger`,
          );
        }
      });

      if (voicing.barre) {
        const { fret, firstString, lastString } = voicing.barre;
        check(firstString < lastString, `${where}: barre spans a single string`);
        check(fret === voicing.position, `${where}: barre is not at the lowest fingered fret`);

        // Free fingers on one side of the barre only.
        const outside = voicing.frets
          .map((f, string) => ({ f, string }))
          .filter(({ f, string }) => f !== null && f > 0 && (string < firstString || string > lastString));
        check(
          !(
            outside.some(({ string }) => string < firstString) &&
            outside.some(({ string }) => string > lastString)
          ),
          `${where}: fingers fall on both sides of the barre`,
        );
        for (let string = firstString; string <= lastString; string += 1) {
          check(
            voicing.frets[string] !== null,
            `${where}: string ${string} is muted underneath the barre`,
          );
          check(
            (voicing.frets[string] ?? 0) >= fret,
            `${where}: string ${string} is fretted behind the barre`,
          );
          if (voicing.frets[string] === fret) {
            check(
              voicing.fingers[string] === 1,
              `${where}: string ${string} sits on the barre but is not the index finger`,
            );
          }
        }
      }

      // ── Register ────────────────────────────────────────────────────────
      const pitches = sounding.map((string) => midiAt(string, voicing.frets[string]!)).sort(
        (a, b) => a - b,
      );
      for (let i = 0; i + 1 < pitches.length; i += 1) {
        const gap = pitches[i + 1] - pitches[i];
        for (const rule of MUD_RULES) {
          check(
            !(pitches[i] < rule.below && gap < rule.minGap),
            `${where}: ${gap} semitones at MIDI ${pitches[i]} is mud`,
          );
        }
      }

      // ── Identity of the record itself ───────────────────────────────────
      check(voicing.id === chartFor(voicing.frets), `${where}: id does not match its frets`);
      check(
        voicing.bass !== '1' || rooted.includes(voicing),
        `${where}: root-position shape appeared in the inversions pass`,
      );
    }

    // Root position and inversions must be disjoint.
    const rootedIds = new Set(rooted.map((v) => v.id));
    for (const voicing of inversions) {
      check(!rootedIds.has(voicing.id), `${chord.symbol}: ${voicing.id} is in both passes`);
    }
  }
}

// ── Pins reorder, never inject ─────────────────────────────────────────────
for (const key of Object.keys(PINNED_SHAPES)) {
  const [root, typeId] = key.split(':');
  const type = CHORD_TYPES.find((t) => t.id === typeId);
  check(Boolean(type), `pin "${key}": no chord type "${typeId}"`);
  check(ROOTS.includes(root as never), `pin "${key}": no root "${root}"`);
  if (!type) continue;

  const chord = buildChord(root as never, type);
  const normalised = pinnedFor(chord);
  check(
    normalised.length === PINNED_SHAPES[key].length,
    `pin "${key}": a pattern is not six entries of fret-or-x`,
  );

  const generated = new Set(generateVoicings(chord).map((voicing) => voicing.id));
  for (const pattern of normalised) {
    check(
      generated.has(pattern),
      `pin "${key}": the generator never produced "${pattern}" — that is a generator bug, not a missing chord`,
    );
  }

  // A pin that is already what the generator ranks first is dead weight.
  const first = generateVoicings(chord)[0];
  if (first && normalised.length === 1 && first.id === normalised[0]) {
    console.log(`  note: pin ${pinKey(chord)} is redundant — the generator already ranks it first`);
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\nChecked ${chordCount} chords, ${voicingCount} voicings.`);

if (chordsWithNoShapes.length > 0) {
  console.log(`\n${chordsWithNoShapes.length} chords have no root-position shape:`);
  console.log(`  ${chordsWithNoShapes.join(', ')}`);
}

if (failures.length > 0) {
  const shown = failures.slice(0, 40);
  console.error(`\n${failures.length} failures:`);
  for (const failure of shown) console.error(`  ${failure}`);
  if (failures.length > shown.length) console.error(`  … and ${failures.length - shown.length} more`);
  process.exit(1);
}

console.log('All invariants hold.');
