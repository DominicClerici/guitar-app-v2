import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { pluck, prepare, release } from '@/features/scale-visualizer';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { isRootName, type RootName } from '@/lib/chord-library';
import { CAGED_FORMS, cagedFormWindow, cagedMarks, type CagedMark } from '@/lib/guitar-positions';
import { noteToPitchClass } from '@/lib/scale-library';
import { midiAt } from '@/lib/theory';
import { useToken } from '@/lib/tokens';

import { claimPlayback, releasePlayback } from '../playbackBus';

// Live block `caged-shape`: one CAGED form of one chord, drawn as the five-fret
// window it occupies, with every note of the chosen layer marked by its degree.
//
// The `show` prop is the whole point. The four layers nest — roots ⊂ triad ⊂
// pentatonic ⊂ scale — so a pathway can hand the learner the same window four
// times and let them watch it fill in, rather than teaching four unrelated
// diagrams. Chapters 1–4 of the CAGED pathway are exactly that progression.

export const cagedShapePropsSchema = z.object({
  root: z.string().refine(isRootName, 'not a root the chord library can spell'),
  form: z.enum(CAGED_FORMS),
  show: z.enum(['roots', 'triad', 'pentatonic', 'scale']).default('triad'),
  /** Overrides the line under the heading, which otherwise names the layer. */
  caption: z.string().optional(),
});

export type CagedShapeProps = z.infer<typeof cagedShapePropsSchema>;

/** Matches ScaleCompare, which matches the scale visualizer's practice speed. */
const STEP_MS = 340;

const LAYER_CAPTION: Record<CagedShapeProps['show'], string> = {
  roots: 'Every root in the window',
  triad: 'Root, third and fifth',
  pentatonic: 'The major pentatonic',
  scale: 'The whole major scale',
};

// Geometry. Tailwind classes have to be static strings, so these numbers exist
// only to be read alongside the classes below — they have to move together:
//   open column w-[32px] · fretted column w-[42px] · string row h-[26px]
const colClass = (fret: number) => (fret === 0 ? 'w-[32px]' : 'w-[42px]');

// Wound strings read thicker than the trebles; string 0 is the high e.
const STRING_CLASS = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15]);

const markKey = (mark: Pick<CagedMark, 'string' | 'fret'>) => `${mark.string}-${mark.fret}`;

export function CagedShape({ root, form, show, caption }: CagedShapeProps) {
  const onAccent = useToken('--on-accent', '#04211f');

  const [sounding, setSounding] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
    setSounding(null);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      releasePlayback(stop);
      release();
    },
    [stop],
  );

  const rootPc = noteToPitchClass(root as RootName);
  const formWindow = cagedFormWindow(rootPc, form);
  if (!formWindow) return null;

  const marks = cagedMarks(rootPc, formWindow, show);
  const byPosition = new Map(marks.map((mark) => [markKey(mark), mark]));
  const frets = Array.from(
    { length: formWindow.to - formWindow.from + 1 },
    (_, i) => formWindow.from + i,
  );

  // Low to high, so the window sounds like something a hand would run through it.
  const run = [...marks].sort((a, b) => midiAt(a.string, a.fret) - midiAt(b.string, b.fret));

  const play = () => {
    stop();
    claimPlayback(stop);
    void prepare();
    setPlaying(true);

    let at = 0;
    const tick = () => {
      if (at >= run.length) {
        stop();
        releasePlayback(stop);
        return;
      }
      const mark = run[at];
      pluck(midiAt(mark.string, mark.fret));
      setSounding(markKey(mark));
      at += 1;
    };

    tick();
    timer.current = setInterval(tick, STEP_MS);
  };

  const name = `${toAccidentalGlyphs(root)} major`;

  return (
    <View className="mt-[18px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[14px]">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">
            {form} form
            <Text className="text-ink-faint">{`  ·  ${name}`}</Text>
          </Text>
          <Text className="mt-[2px] text-[11px] leading-[15px] text-ink-faint">
            {caption ?? LAYER_CAPTION[show]}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (playing) {
              stop();
              releasePlayback(stop);
            } else {
              play();
            }
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${playing ? 'Stop' : 'Play'} the ${form} form of ${name}`}
          className="h-[30px] w-[30px] items-center justify-center rounded-full bg-accent active:opacity-80"
        >
          <SymbolView
            name={playing ? 'stop.fill' : 'play.fill'}
            size={11}
            tintColor={onAccent}
            style={playing ? undefined : { marginLeft: 1.5 }}
          />
        </Pressable>
      </View>

      <View className="mt-[12px] self-center">
        <View>
          <InlayRow frets={frets} />

          {STRING_CLASS.map((thickness, string) => (
            <View key={string} className="h-[26px] flex-row">
              <View className="pointer-events-none absolute inset-0 justify-center">
                <View className={`${thickness} bg-ink-faint`} />
              </View>

              {frets.map((fret) => (
                <Cell
                  key={fret}
                  fret={fret}
                  mark={byPosition.get(`${string}-${fret}`)}
                  sounding={sounding === `${string}-${fret}`}
                />
              ))}
            </View>
          ))}
        </View>

        <View className="mt-[6px] flex-row">
          {frets.map((fret) => (
            <View key={fret} className={`${colClass(fret)} items-center`}>
              <Text className="font-mono text-[9px] tracking-[0.5px] text-ink-faint">{fret}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * One position. The cell's right border doubles as the fret wire, and is the nut
 * when the window reaches fret 0 — the same treatment the scale visualizer's neck
 * gives it, so a diagram in an article and the board it links to read alike.
 */
function Cell({
  fret,
  mark,
  sounding,
}: {
  fret: number;
  mark: CagedMark | undefined;
  sounding: boolean;
}) {
  const frame = `${colClass(fret)} h-full items-center justify-center ${
    fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
  }`;

  if (!mark) return <View className={frame} />;

  const face = sounding
    ? 'bg-accent-bright'
    : mark.isRoot
      ? 'bg-accent'
      : 'border border-line bg-surface-raised';

  const ink = sounding || mark.isRoot ? 'text-on-accent' : 'text-ink-muted';

  return (
    <View className={frame}>
      <View className={`items-center justify-center ${sounding ? 'scale-110' : ''}`}>
        {/* The root reads as lit, the way it does on the visualizer's board. */}
        {mark.isRoot ? (
          <View className="absolute h-[28px] w-[28px] rounded-full bg-accent-wash" />
        ) : null}

        <View className={`h-[22px] w-[22px] items-center justify-center rounded-full ${face}`}>
          <Text className={`text-[10px] font-bold ${ink}`}>{mark.degree}</Text>
        </View>
      </View>
    </View>
  );
}

/** Inlays, on the same column grid so they centre in their fret. */
function InlayRow({ frets }: { frets: number[] }) {
  return (
    <View className="pointer-events-none absolute inset-x-0 top-1/2 -mt-[4px] flex-row">
      {frets.map((fret) => (
        <View key={fret} className={`${colClass(fret)} items-center`}>
          {SINGLE_INLAYS.has(fret) || fret === 12 ? (
            <View className="h-[7px] w-[7px] rounded-full bg-line" />
          ) : null}
        </View>
      ))}
    </View>
  );
}
