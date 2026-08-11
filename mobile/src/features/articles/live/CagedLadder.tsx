import { Text, View } from 'react-native';
import { z } from 'zod';

import { FadingHScroll } from '@/components/FadingHScroll';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { isRootName, type RootName } from '@/lib/chord-library';
import { CAGED_FORMS, cagedFormWindows, cagedLadderLanes, cagedMarks } from '@/lib/guitar-positions';
import { noteToPitchClass } from '@/lib/scale-library';
import { FRET_COUNT, STRING_COUNT } from '@/lib/theory';

// Live block `caged-ladder`: all five forms of one chord at once, along the whole
// neck, with every root marked.
//
// This is the claim `caged-shape` cannot make on its own — that the five forms are
// not alternatives but consecutive windows that tile the neck and overlap at their
// edges. The bands alternate between two lanes so that neighbouring forms are
// never drawn on the same line: the overlap then shows up as two bands sitting
// above one another over the same frets, which is the thing to see.

export const cagedLadderPropsSchema = z.object({
  root: z.string().refine(isRootName, 'not a root the chord library can spell'),
  /** Draws this form lit and the other four quiet. Omit to weight them equally. */
  highlight: z.enum(CAGED_FORMS).optional(),
});

export type CagedLadderProps = z.infer<typeof cagedLadderPropsSchema>;

// Geometry, matching the scale visualizer's board so the two read as the same
// neck. Static Tailwind classes below carry the same numbers:
//   open column w-[38px] · fretted column w-[50px] · board w-[788px] (38 + 15×50)
const colClass = (fret: number) => (fret === 0 ? 'w-[38px]' : 'w-[50px]');

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);
const STRINGS = Array.from({ length: STRING_COUNT }, (_, string) => string);

const STRING_CLASS = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const SINGLE_INLAYS = [3, 5, 7, 9, 15];
const DOUBLE_INLAY = 12;
const MARKED_FRETS = new Set([...SINGLE_INLAYS, DOUBLE_INLAY]);

export function CagedLadder({ root, highlight }: CagedLadderProps) {
  const rootPc = noteToPitchClass(root as RootName);
  const windows = cagedFormWindows(rootPc);

  const roots = new Set(
    windows.flatMap((window) =>
      cagedMarks(rootPc, window, 'roots').map((mark) => `${mark.string}-${mark.fret}`),
    ),
  );

  const lanes = cagedLadderLanes(rootPc);

  return (
    <View className="mt-[18px]">
      <Text className="px-[2px] text-[11px] leading-[15px] text-ink-faint">
        {`The five forms of ${toAccidentalGlyphs(root)} major, and every root they hold.`}
      </Text>

      <FadingHScroll contentClassName="px-[18px] py-[8px]">
        <View className="w-[788px]">
          {lanes.map((lane, index) => (
            <View key={index} className="mb-[3px] flex-row">
              {FRETS.map((fret) => {
                const band = lane.find((window) => fret >= window.from && fret <= window.to);
                const lit = band !== undefined && (!highlight || band.form === highlight);

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
                          {`${band.form} form`}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          <View className="mt-[4px]">
            <InlayRow frets={SINGLE_INLAYS} offsetClass="-mt-[4px]" />
            <InlayRow frets={[DOUBLE_INLAY]} offsetClass="-mt-[34px]" />
            <InlayRow frets={[DOUBLE_INLAY]} offsetClass="mt-[26px]" />

            {STRINGS.map((string) => (
              <View key={string} className="h-[30px] flex-row">
                <View className="pointer-events-none absolute inset-0 justify-center">
                  <View className={`${STRING_CLASS[string]} bg-ink-faint`} />
                </View>

                {FRETS.map((fret) => (
                  <View
                    key={fret}
                    className={`${colClass(fret)} h-full items-center justify-center ${
                      fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
                    }`}
                  >
                    {roots.has(`${string}-${fret}`) ? (
                      <View className="items-center justify-center">
                        <View className="absolute h-[26px] w-[26px] rounded-full bg-accent-wash" />
                        <View className="h-[20px] w-[20px] items-center justify-center rounded-full bg-accent">
                          <Text className="text-[9px] font-bold text-on-accent">1</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View className="mt-[7px] flex-row">
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
