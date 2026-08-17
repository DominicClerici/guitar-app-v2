import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { pluck, prepare, release } from '@/features/scale-visualizer';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { isRootName, type RootName } from '@/lib/chord-library';
import {
  STRING_SET_INDICES,
  STRING_SETS,
  TRIAD_INVERSIONS,
  TRIAD_QUALITIES,
  TRIAD_SYMBOL,
  triadVoicing,
} from '@/lib/guitar-positions';
import { noteToPitchClass } from '@/lib/scale-library';
import { midiAt, STRING_COUNT, STRING_LABELS } from '@/lib/theory';

import { claimPlayback, releasePlayback } from '../playbackBus';

// Live block `triad-shape`: one close-voiced triad — one quality, one string
// set, one inversion — drawn where it actually sits on the neck.
//
// The contrast with `caged-shape` is deliberate and worth keeping straight when
// authoring: a CAGED window draws every note it contains and leaves the grip
// open, so a lesson has to say which dots a hand takes. A triad has no such gap.
// Three dots are the chord, the grip and the diagram at once, which is why the
// unused strings are drawn muted rather than left blank — what you do not play
// is part of the shape.

export const triadShapePropsSchema = z.object({
  root: z.string().refine(isRootName, 'not a root the chord library can spell'),
  quality: z.enum(TRIAD_QUALITIES).default('major'),
  /** Which three adjacent strings, named from the high e as the lessons name them. */
  strings: z.enum(STRING_SETS),
  inversion: z.enum(TRIAD_INVERSIONS).default('root'),
  /** Takes the copy at or above this fret, when a lesson wants the one further up. */
  minFret: z.number().int().min(0).optional(),
  /** Overrides the line under the heading, which otherwise names the inversion. */
  caption: z.string().optional(),
});

export type TriadShapeProps = z.infer<typeof triadShapePropsSchema>;

/** Faster than ScaleCompare's scale run: three notes read as a chord, not a scale. */
const STEP_MS = 260;

/** Five columns unless the grip needs more — the same window `caged-shape` draws. */
const MIN_COLUMNS = 5;

const INVERSION_LABEL = {
  root: 'Root position',
  first: 'First inversion',
  second: 'Second inversion',
} as const;

const BASS_LABEL = {
  root: 'the root in the bass',
  first: 'the third in the bass',
  second: 'the fifth in the bass',
} as const;

const QUALITY_LABEL = {
  major: 'major',
  minor: 'minor',
  diminished: 'diminished',
  augmented: 'augmented',
} as const;

// Geometry. Tailwind classes have to be static strings, so these numbers exist
// only to be read alongside the classes below — they have to move together:
//   gutter w-[20px] · open column w-[32px] · fretted column w-[42px] · row h-[26px]
const colClass = (fret: number) => (fret === 0 ? 'w-[32px]' : 'w-[42px]');

const STRING_CLASS = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15]);

const STRINGS = Array.from({ length: STRING_COUNT }, (_, string) => string);

const positionKey = (string: number, fret: number) => `${string}-${fret}`;

export function TriadShape({ root, quality, strings, inversion, minFret, caption }: TriadShapeProps) {
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
  const voicing = triadVoicing(rootPc, quality, strings, inversion, minFret ?? 0);
  if (!voicing) return null;

  const byPosition = new Map(
    voicing.notes.map((note) => [positionKey(note.string, note.fret), note]),
  );
  const onSet = new Set<number>(STRING_SET_INDICES[strings]);

  // One fret of air below the grip, and at least five columns, so two diagrams of
  // the same set read as the same board rather than as different zoom levels.
  const from = Math.max(0, voicing.from - 1);
  const to = Math.max(from + MIN_COLUMNS - 1, voicing.to + 1);
  const frets = Array.from({ length: to - from + 1 }, (_, index) => from + index);

  const play = () => {
    stop();
    claimPlayback(stop);
    void prepare();
    setPlaying(true);

    let at = 0;
    const tick = () => {
      if (at >= voicing.notes.length) {
        stop();
        releasePlayback(stop);
        return;
      }
      const note = voicing.notes[at];
      pluck(midiAt(note.string, note.fret));
      setSounding(positionKey(note.string, note.fret));
      at += 1;
    };

    tick();
    timer.current = setInterval(tick, STEP_MS);
  };

  const symbol = `${toAccidentalGlyphs(root)}${TRIAD_SYMBOL[quality]}`;
  const spoken = `${root} ${QUALITY_LABEL[quality]}`;

  return (
    <View className="mt-[18px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[14px]">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">
            {symbol}
            <Text className="text-ink-faint">{`  ·  strings ${strings}`}</Text>
          </Text>
          <Text className="mt-[2px] text-[11px] leading-[15px] text-ink-faint">
            {caption ?? `${INVERSION_LABEL[inversion]} — ${BASS_LABEL[inversion]}`}
          </Text>
        </View>
        <Button
          variant="primary"
          size="xs"
          square
          radius={999}
          icon={playing ? 'stop.fill' : 'play.fill'}
          hitSlop={8}
          accessibilityLabel={`${playing ? 'Stop' : 'Play'} the ${INVERSION_LABEL[
            inversion
          ].toLowerCase()} of ${spoken} on strings ${strings}`}
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
        <View className="flex-row">
          <View className="w-[20px]">
            {STRINGS.map((string) => (
              <View key={string} className="h-[26px] items-center justify-center">
                <Text
                  className={`font-mono text-[9px] ${
                    onSet.has(string) ? 'text-ink-muted' : 'text-ink-faint'
                  }`}
                >
                  {onSet.has(string) ? STRING_LABELS[string] : '×'}
                </Text>
              </View>
            ))}
          </View>

          <View>
            <InlayRow frets={frets} />

            {STRINGS.map((string) => (
              <View key={string} className="h-[26px] flex-row">
                <View className="pointer-events-none absolute inset-0 justify-center">
                  <View
                    className={`${STRING_CLASS[string]} ${
                      onSet.has(string) ? 'bg-ink-faint' : 'bg-line-soft'
                    }`}
                  />
                </View>

                {frets.map((fret) => (
                  <Cell
                    key={fret}
                    fret={fret}
                    note={byPosition.get(positionKey(string, fret))}
                    sounding={sounding === positionKey(string, fret)}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-[6px] flex-row pl-[20px]">
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
 * when the window reaches fret 0 — the same treatment `caged-shape` and the scale
 * visualizer's neck give it, so every board in the app reads alike.
 */
function Cell({
  fret,
  note,
  sounding,
}: {
  fret: number;
  note: { degree: string; isRoot: boolean } | undefined;
  sounding: boolean;
}) {
  const frame = `${colClass(fret)} h-full items-center justify-center ${
    fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
  }`;

  if (!note) return <View className={frame} />;

  const face = sounding
    ? 'bg-accent-bright'
    : note.isRoot
      ? 'bg-accent'
      : 'border border-line bg-surface-raised';

  const ink = sounding || note.isRoot ? 'text-on-accent' : 'text-ink-muted';

  return (
    <View className={frame}>
      <View className={`items-center justify-center ${sounding ? 'scale-110' : ''}`}>
        {note.isRoot ? (
          <View className="absolute h-[28px] w-[28px] rounded-full bg-accent-wash" />
        ) : null}

        <View className={`h-[22px] w-[22px] items-center justify-center rounded-full ${face}`}>
          <Text className={`text-[10px] font-bold ${ink}`}>{note.degree}</Text>
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
