import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { pluck, prepare, release } from '@/features/scale-visualizer';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { isRootName, type RootName } from '@/lib/chord-library';
import {
  CAGED_FORMS,
  CAGED_QUALITIES,
  cagedFillMarks,
  cagedFormWindow,
  cagedMarks,
  type CagedMark,
  type CagedQuality,
} from '@/lib/guitar-positions';
import { noteToPitchClass, scaleTypeById, type ScaleType } from '@/lib/scale-library';
import { midiAt } from '@/lib/theory';

import { claimPlayback, releasePlayback } from '../playbackBus';

// Live block `caged-shape`: one CAGED form of one chord, drawn as the five-fret
// window it occupies, with every note of the chosen layer marked by its degree.
//
// The `show` prop is the whole point. The four layers nest — roots ⊂ triad ⊂
// pentatonic ⊂ scale — so a pathway can hand the learner the same window four
// times and let them watch it fill in, rather than teaching four unrelated
// diagrams. Chapters 1–4 of the CAGED pathway are exactly that progression.
//
// `quality` runs the same progression in minor, and deliberately leaves the
// window alone: a form is a fret span anchored on the root, so A minor's E form
// covers the frets A major's does. Only the dots move, which is the minor CAGED
// pathway's central claim and is worth seeing rather than being told.
//
// `scale` generalises that last step: any scale in the catalogue can fill the
// window instead of a chord layer, and the tone the catalogue names the scale for
// is tinted in the hue the neck already tints it. A mode is its parent minor or
// major window with one dot moved, and the modes pathway needs that drawn rather
// than asserted — the window stays put for the same reason it does in minor.

export const cagedShapePropsSchema = z.object({
  root: z.string().refine(isRootName, 'not a root the chord library can spell'),
  form: z.enum(CAGED_FORMS),
  quality: z.enum(CAGED_QUALITIES).default('major'),
  show: z.enum(['roots', 'triad', 'pentatonic', 'scale']).default('triad'),
  /** A scale-library id. Fills the window with that scale, ignoring quality/show. */
  scale: z
    .string()
    .refine((id) => scaleTypeById(id) !== undefined, 'not a scale in the catalogue')
    .optional(),
  /** Overrides the line under the heading, which otherwise names the layer. */
  caption: z.string().optional(),
});

export type CagedShapeProps = z.infer<typeof cagedShapePropsSchema>;

/** Matches ScaleCompare, which matches the scale visualizer's practice speed. */
const STEP_MS = 340;

const LAYER_CAPTION: Record<CagedQuality, Record<CagedShapeProps['show'], string>> = {
  major: {
    roots: 'Every root in the window',
    triad: 'Root, third and fifth',
    pentatonic: 'The major pentatonic',
    scale: 'The whole major scale',
  },
  minor: {
    roots: 'Every root in the window',
    triad: 'Root, flat third and fifth',
    pentatonic: 'The minor pentatonic',
    scale: 'The whole natural minor scale',
  },
};

// Geometry. Tailwind classes have to be static strings, so these numbers exist
// only to be read alongside the classes below — they have to move together:
//   open column w-[32px] · fretted column w-[42px] · string row h-[26px]
const colClass = (fret: number) => (fret === 0 ? 'w-[32px]' : 'w-[42px]');

// Wound strings read thicker than the trebles; string 0 is the high e.
const STRING_CLASS = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15]);

const markKey = (mark: Pick<CagedMark, 'string' | 'fret'>) => `${mark.string}-${mark.fret}`;

/**
 * Tinting for the tone a scale is named for, matching the hues the neck already
 * tints it. Border and ink are separate strings because a Text does not inherit
 * colour through a View.
 */
const ACCENT_CLASS: Record<NonNullable<ScaleType['accent']>['hue'], { edge: string; ink: string }> =
  {
    amber: { edge: 'border-amber bg-amber-wash', ink: 'text-amber' },
    rose: { edge: 'border-rose bg-rose-wash', ink: 'text-rose' },
    violet: { edge: 'border-violet bg-violet-wash', ink: 'text-violet' },
  };

export function CagedShape({ root, form, quality, show, scale: scaleId, caption }: CagedShapeProps) {
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

  const scaleType = scaleId === undefined ? undefined : scaleTypeById(scaleId);

  const marks = scaleType
    ? cagedFillMarks(rootPc, formWindow, {
        semitones: scaleType.semitones,
        degrees: scaleType.degrees,
        accentDegree: scaleType.accent?.degree,
      })
    : cagedMarks(rootPc, formWindow, show, quality);

  const accentClass = scaleType?.accent ? ACCENT_CLASS[scaleType.accent.hue] : null;
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

  const name = `${toAccidentalGlyphs(root)} ${scaleType ? scaleType.name : quality}`;

  return (
    <View className="mt-[18px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[14px]">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">
            {form} form
            <Text className="text-ink-faint">{`  ·  ${name}`}</Text>
          </Text>
          <Text className="mt-[2px] text-[11px] leading-[15px] text-ink-faint">
            {caption ?? (scaleType ? scaleType.character : LAYER_CAPTION[quality][show])}
          </Text>
        </View>
        <Button
          variant="primary"
          size="xs"
          square
          radius={999}
          icon={playing ? 'stop.fill' : 'play.fill'}
          hitSlop={8}
          accessibilityLabel={`${playing ? 'Stop' : 'Play'} the ${form} form of ${name}`}
          onPress={() => {
            if (playing) {
              stop();
              releasePlayback(stop);
            } else {
              play();
            }
          }}
        />
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
                  accentClass={accentClass}
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
  accentClass,
  sounding,
}: {
  fret: number;
  mark: CagedMark | undefined;
  /** Edge and ink classes for the scale's characteristic tone, when it has one. */
  accentClass: { edge: string; ink: string } | null;
  sounding: boolean;
}) {
  const frame = `${colClass(fret)} h-full items-center justify-center ${
    fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
  }`;

  if (!mark) return <View className={frame} />;

  // The root outranks the accent: a tinted dot says "this is the note the scale
  // is named for", and a scale whose accent sat on its own root would have
  // nothing to be named against.
  const tinted = accentClass !== null && mark.isAccent && !mark.isRoot;

  const face = sounding
    ? 'bg-accent-bright'
    : mark.isRoot
      ? 'bg-accent'
      : tinted
        ? `border ${accentClass.edge}`
        : 'border border-line bg-surface-raised';

  const ink =
    sounding || mark.isRoot ? 'text-on-accent' : tinted ? accentClass.ink : 'text-ink-muted';

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
