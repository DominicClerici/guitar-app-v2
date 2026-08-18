// Turning a written progression into something that can be sounded.
//
//   ["Am", "F", "C", "G"] → a playable shape per chord, and the pitches it strums
//
// The chord library owns spelling and the voicing engine owns which shapes a hand
// can hold; all this adds is "pick one, and say what it sounds like". It picks the
// curated shape where the voicing engine has one pinned, which is what makes an
// authored `Am F C G` come out as the open chords a player would actually reach
// for rather than the highest-scoring shape in the abstract.
//
// Pure string/number math over @/lib/theory's neck. No React, no native modules.

import { buildChord, parseChordSymbol, type Chord } from '../chord-library';
import { applyPins, generateVoicings, type Voicing } from '../guitar-voicings';
import { soundingMidi, STANDARD } from '../tuning';

export interface ProgressionChord {
  /** The symbol as authored, so a caption can print what was written. */
  symbol: string;
  chord: Chord;
  voicing: Voicing;
  /** What a strum sounds, low string to high — the order a pick crosses them. */
  midis: number[];
}

/**
 * The pitches a voicing sounds, lowest first.
 *
 * `Voicing.frets` is indexed 0 = high e, so this walks it backwards. Reading that
 * array the other way round is the one bug the voicing engine's own header warns
 * about, and a progression that strums high-to-low is exactly how it would show.
 */
export function strumMidis(voicing: Voicing): number[] {
  const midis: number[] = [];

  for (let string = voicing.frets.length - 1; string >= 0; string -= 1) {
    const fret = voicing.frets[string];
    if (fret !== null) midis.push(soundingMidi(STANDARD, string, fret));
  }

  return midis;
}

/**
 * Reads a written progression, dropping any symbol the chord library cannot
 * parse and any chord the generator finds no shape for.
 *
 * Dropping rather than throwing is deliberate: a `live` block renders inside an
 * article, and one bad symbol should cost that chord rather than the lesson.
 *
 * Standard tuning, deliberately, and the only place in the app that now says so out loud. This
 * reads a progression written into an article, and the articles teach standard tuning — the pinned
 * open shapes are what an author means by `Am F C G`, and the prose around them names the strings
 * they are held on. Handing this the user's tuning would redraw a lesson's own diagram.
 */
export function readProgression(symbols: readonly string[]): ProgressionChord[] {
  const found: ProgressionChord[] = [];

  for (const symbol of symbols) {
    const parsed = parseChordSymbol(symbol);
    if (!parsed) continue;

    const chord = buildChord(parsed.root, parsed.type);
    const voicing = applyPins(chord, generateVoicings(STANDARD, chord))[0];
    if (!voicing) continue;

    found.push({ symbol, chord, voicing, midis: strumMidis(voicing) });
  }

  return found;
}
