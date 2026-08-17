import { Text, View } from 'react-native';
import { z } from 'zod';

import { FadingHScroll } from '@/components/FadingHScroll';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { isRootName, type RootName } from '@/lib/chord-library';
import {
  STRING_SET_INDICES,
  STRING_SETS,
  TRIAD_INVERSIONS,
  TRIAD_QUALITIES,
  TRIAD_SYMBOL,
  triadLadder,
  triadLadderLanes,
} from '@/lib/guitar-positions';
import { noteToPitchClass } from '@/lib/scale-library';
import { FRET_COUNT, STRING_LABELS } from '@/lib/theory';

// Live block `triad-ladder`: every inversion of one triad along one string set,
// drawn on the three strings it lives on.
//
// This is the claim `triad-shape` cannot make alone — that the three inversions
// are not three alternatives but one cycle of chord tones climbing the set, and
// that it starts over an octave up. Drawing only the set's own strings is the
// point rather than a saving: the ladder is a property of those three strings,
// and a six-string board would bury it in empty rows.

export const triadLadderPropsSchema = z.object({
  root: z.string().refine(isRootName, 'not a root the chord library can spell'),
  quality: z.enum(TRIAD_QUALITIES).default('major'),
  strings: z.enum(STRING_SETS),
  /** Lights every copy of this inversion and quiets the rest. Omit to weight them equally. */
  highlight: z.enum(TRIAD_INVERSIONS).optional(),
  caption: z.string().optional(),
});

export type TriadLadderProps = z.infer<typeof triadLadderPropsSchema>;

const BAND_LABEL = { root: 'root', first: '1st', second: '2nd' } as const;

const QUALITY_LABEL = {
  major: 'major',
  minor: 'minor',
  diminished: 'diminished',
  augmented: 'augmented',
} as const;

// Geometry, matching `caged-ladder` so the two read as the same neck. Static
// Tailwind classes below carry the same numbers:
//   gutter w-[20px] · open column w-[38px] · fretted column w-[50px] · board w-[808px]
const colClass = (fret: number) => (fret === 0 ? 'w-[38px]' : 'w-[50px]');

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);

const STRING_CLASS = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const SINGLE_INLAYS = [3, 5, 7, 9, 15];
const DOUBLE_INLAY = 12;
const MARKED_FRETS = new Set([...SINGLE_INLAYS, DOUBLE_INLAY]);

export function TriadLadder({ root, quality, strings, highlight, caption }: TriadLadderProps) {
  const rootPc = noteToPitchClass(root as RootName);
  const voicings = triadLadder(rootPc, quality, strings);
  const lanes = triadLadderLanes(voicings);

  // High string first, the way every board in the app is drawn.
  const rows = [...STRING_SET_INDICES[strings]].reverse();

  // Two inversions can land a note on the same position, so a dot is lit if *any*
  // voicing holding it is — quieting it because the other one asked would read as
  // the note not being in the highlighted shape at all.
  const dots = new Map<string, { degree: string; isRoot: boolean; lit: boolean }>();
  for (const voicing of voicings) {
    const lit = !highlight || voicing.inversion === highlight;
    for (const note of voicing.notes) {
      const key = `${note.string}-${note.fret}`;
      const seen = dots.get(key);
      dots.set(key, { degree: note.degree, isRoot: note.isRoot, lit: lit || (seen?.lit ?? false) });
    }
  }

  const symbol = `${toAccidentalGlyphs(root)}${TRIAD_SYMBOL[quality]}`;

  return (
    <View className="mt-[18px]">
      <Text className="px-[2px] text-[11px] leading-[15px] text-ink-faint">
        {caption ??
          `Every inversion of ${symbol} ${QUALITY_LABEL[quality]} on strings ${strings}, and where the cycle starts again.`}
      </Text>

      <FadingHScroll contentClassName="px-[18px] py-[8px]">
        <View className="w-[808px]">
          {lanes.map((lane, index) => (
            <View key={index} className="mb-[3px] flex-row pl-[20px]">
              {FRETS.map((fret) => {
                const band = lane.find(
                  (voicing) => fret >= voicing.from && fret <= voicing.to,
                );
                const lit = band !== undefined && (!highlight || band.inversion === highlight);

                return (
                  <View key={fret} className={`${colClass(fret)} items-center`}>
                    <View
                      className={`h-[16px] w-full items-center justify-center rounded-[3px] ${
                        band ? (lit ? 'bg-accent-wash' : 'bg-surface-raised') : ''
                      }`}
                    >
                      {band?.from === fret ? (
                        <Text
                          className={`font-mono text-[9px] ${lit ? 'text-accent' : 'text-ink-faint'}`}
                        >
                          {BAND_LABEL[band.inversion]}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          <View className="mt-[4px] flex-row">
            <View className="w-[20px]">
              {rows.map((string) => (
                <View key={string} className="h-[30px] items-center justify-center">
                  <Text className="font-mono text-[9px] text-ink-muted">
                    {STRING_LABELS[string]}
                  </Text>
                </View>
              ))}
            </View>

            <View>
              <InlayRow frets={SINGLE_INLAYS} offsetClass="-mt-[4px]" />
              <InlayRow frets={[DOUBLE_INLAY]} offsetClass="-mt-[19px]" />
              <InlayRow frets={[DOUBLE_INLAY]} offsetClass="mt-[11px]" />

              {rows.map((string) => (
                <View key={string} className="h-[30px] flex-row">
                  <View className="pointer-events-none absolute inset-0 justify-center">
                    <View className={`${STRING_CLASS[string]} bg-ink-faint`} />
                  </View>

                  {FRETS.map((fret) => {
                    const dot = dots.get(`${string}-${fret}`);

                    return (
                      <View
                        key={fret}
                        className={`${colClass(fret)} h-full items-center justify-center ${
                          fret === 0
                            ? 'border-r-[3px] border-r-ink-muted'
                            : 'border-r border-r-line-soft'
                        }`}
                      >
                        {dot ? <Dot degree={dot.degree} isRoot={dot.isRoot} lit={dot.lit} /> : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          <View className="mt-[7px] flex-row pl-[20px]">
            {FRETS.map((fret) => (
              <View key={fret} className={`${colClass(fret)} items-center`}>
                <Text
                  className={`font-mono text-[9px] tracking-[0.5px] ${
                    MARKED_FRETS.has(fret) ? 'text-ink-muted' : 'text-ink-faint'
                  }`}
                >
                  {fret}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </FadingHScroll>
    </View>
  );
}

function Dot({ degree, isRoot, lit }: { degree: string; isRoot: boolean; lit: boolean }) {
  if (!lit) {
    return (
      <View className="h-[20px] w-[20px] items-center justify-center rounded-full border border-line-soft bg-surface">
        <Text className="text-[9px] font-bold text-ink-faint">{degree}</Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center">
      {isRoot ? <View className="absolute h-[26px] w-[26px] rounded-full bg-accent-wash" /> : null}

      <View
        className={`h-[20px] w-[20px] items-center justify-center rounded-full ${
          isRoot ? 'bg-accent' : 'border border-line bg-surface-raised'
        }`}
      >
        <Text className={`text-[9px] font-bold ${isRoot ? 'text-on-accent' : 'text-ink-muted'}`}>
          {degree}
        </Text>
      </View>
    </View>
  );
}

/** Inlays, on the same column grid so they centre in their fret. */
function InlayRow({ frets, offsetClass }: { frets: number[]; offsetClass: string }) {
  return (
    <View className={`pointer-events-none absolute inset-x-0 top-1/2 flex-row ${offsetClass}`}>
      {FRETS.map((fret) => (
        <View key={fret} className={`${colClass(fret)} items-center`}>
          {frets.includes(fret) ? <View className="h-[8px] w-[8px] rounded-full bg-line" /> : null}
        </View>
      ))}
    </View>
  );
}
