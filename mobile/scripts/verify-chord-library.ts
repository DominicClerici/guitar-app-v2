// Invariant check for the chord library. There is no test runner in this
// project, so this is the verification step for src/lib/chord-library and the
// spelling core it sits on. Run it after touching either:
//
//   node --import ./scripts/ts-resolver.mjs scripts/verify-chord-library.ts
//
// Pass --dump to print every chord for eyeballing the spellings.

import { buildChord, CHORD_TYPES, parseChordSymbol, ROOTS } from '../src/lib/chord-library';
import { DEGREE_SEMITONES, noteToSemitone } from '../src/lib/theory';

const failures: string[] = [];

function check(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

// ── Catalogue shape ────────────────────────────────────────────────────────
const seenIds = new Set<string>();
for (const type of CHORD_TYPES) {
  check(!seenIds.has(type.id), `duplicate chord type id "${type.id}"`);
  seenIds.add(type.id);

  check(type.degrees[0] === '1', `${type.id}: formula must start at the root`);

  check(new Set(type.degrees).size === type.degrees.length, `${type.id}: formula repeats a degree`);

  const semitones = type.degrees.map((degree) => DEGREE_SEMITONES[degree]);
  check(
    new Set(semitones).size === semitones.length,
    `${type.id}: two degrees land on the same pitch class (${type.degrees.join(' ')})`,
  );

  for (const degree of type.dropOrder) {
    check(
      type.degrees.includes(degree),
      `${type.id}: dropOrder lists "${degree}", which is not in the formula`,
    );
  }
  check(
    new Set(type.dropOrder).size === type.dropOrder.length,
    `${type.id}: dropOrder repeats a degree`,
  );
  check(!type.dropOrder.includes('1'), `${type.id}: the root is not droppable here`);
}

// ── Every chord, every root ────────────────────────────────────────────────
let built = 0;
const dump = process.argv.includes('--dump');

for (const root of ROOTS) {
  for (const type of CHORD_TYPES) {
    const chord = buildChord(root, type);
    built += 1;

    check(
      chord.tones.length === type.degrees.length,
      `${chord.symbol}: expected ${type.degrees.length} tones, got ${chord.tones.length}`,
    );

    const rootPc = noteToSemitone(root);
    for (const tone of chord.tones) {
      // The spelled note must actually be the pitch the degree claims.
      const expected = (rootPc + DEGREE_SEMITONES[tone.degree]) % 12;
      check(
        tone.pitchClass === expected,
        `${chord.symbol}: ${tone.degree} spelled "${tone.note}" is pitch class ${tone.pitchClass}, expected ${expected}`,
      );
      check(
        tone.semitones === DEGREE_SEMITONES[tone.degree],
        `${chord.symbol}: ${tone.degree} reports ${tone.semitones} semitones, expected ${DEGREE_SEMITONES[tone.degree]}`,
      );
      check(
        /^[A-G](bb|##|b|#)?$/.test(tone.note),
        `${chord.symbol}: "${tone.note}" is not a usable note name`,
      );
    }

    // No two tones may occupy the same pitch.
    const pitchClasses = chord.tones.map((tone) => tone.pitchClass);
    check(
      new Set(pitchClasses).size === pitchClasses.length,
      `${chord.symbol}: two tones share a pitch class (${chord.tones.map((t) => t.note).join(' ')})`,
    );

    // The essential tones are exactly the formula minus dropOrder.
    const essentialCount = chord.tones.filter((tone) => tone.essential).length;
    check(
      essentialCount === type.degrees.length - type.dropOrder.length,
      `${chord.symbol}: essential-tone count disagrees with dropOrder`,
    );

    // A collapsed spelling must describe the same pitches.
    const collapsed = buildChord(root, type, { spelling: 'collapsed' });
    for (let i = 0; i < collapsed.tones.length; i += 1) {
      check(
        collapsed.tones[i].pitchClass === chord.tones[i].pitchClass,
        `${chord.symbol}: collapsed spelling changes pitch at ${chord.tones[i].degree}`,
      );
    }

    // The printed symbol must parse back to the same chord.
    const reparsed = parseChordSymbol(chord.symbol);
    check(
      reparsed !== null && reparsed.root === root && reparsed.type.id === type.id,
      `${chord.symbol}: does not round-trip through parseChordSymbol`,
    );

    if (dump) {
      const notes = chord.tones.map((t) => t.note.padEnd(3)).join(' ');
      const hint = chord.spellingHint ? `  → ${chord.spellingHint}` : '';
      console.log(`${chord.symbol.padEnd(10)} ${notes}${hint}`);
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
const hinted = ROOTS.flatMap((root) =>
  CHORD_TYPES.map((type) => buildChord(root, type)).filter((chord) => chord.spellingHint),
);

console.log(`\n${built} chords built from ${ROOTS.length} roots × ${CHORD_TYPES.length} types`);
console.log(`${hinted.length} carry a spelling hint toward the enharmonic root`);

if (failures.length > 0) {
  console.error(`\n${failures.length} FAILURES:`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log('All invariants hold.');
