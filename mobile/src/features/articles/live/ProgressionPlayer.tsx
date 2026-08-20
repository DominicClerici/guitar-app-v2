import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import { now, pluck, prepare, release } from '@/features/scale-visualizer';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { chartFor } from '@/lib/guitar-voicings';
import { readProgression, type ProgressionChord } from '@/lib/progressions';

import { claimPlayback, releasePlayback } from '../playbackBus';

// Live block `progression-player`: a written progression, strummed.
//
// Prose can say "these two loops use the same seven notes and land in different
// keys" and the learner has to take it on trust. This is the block that lets them
// hear it, which is the only way that lesson lands. Each chord is the shape the
// voicing engine has curated for it — `Am F C G` comes out as the open chords a
// player would actually reach for.

export const progressionPlayerPropsSchema = z.object({
  /** Chord symbols the chord library can parse: "Am", "F", "Bdim", "E". */
  chords: z.array(z.string()).min(2).max(8),
  /** One chord per beat. 40–160; the default is a comfortable strumming tempo. */
  bpm: z.number().min(40).max(160).default(90),
  /** Overrides the line under the chips, which otherwise names the shapes. */
  caption: z.string().optional(),
});

export type ProgressionPlayerProps = z.infer<typeof progressionPlayerPropsSchema>;

/**
 * How long a pick takes to cross the strings. Strumming all six at one instant
 * reads as a keyboard rather than a guitar; this is the smallest offset that
 * still sounds like a hand.
 */
const STRUM_MS = 22;

/** Each pass through the loop, so a learner hears it settle rather than once. */
const PASSES = 2;

export function ProgressionPlayer({ chords, bpm, caption }: ProgressionPlayerProps) {
  const [at, setAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setAt(null);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      releasePlayback(stop);
      release();
    },
    [stop],
  );

  const progression = readProgression(chords);
  if (progression.length < 2) return null;

  const beatMs = 60_000 / bpm;

  const play = () => {
    stop();
    claimPlayback(stop);
    void prepare();

    let step = 0;
    const tick = () => {
      if (step >= progression.length * PASSES) {
        stop();
        releasePlayback(stop);
        return;
      }

      const index = step % progression.length;
      strum(progression[index]);
      setAt(index);
      step += 1;
    };

    tick();
    timer.current = setInterval(tick, beatMs);
  };

  const playing = at !== null;

  return (
    <View className="mt-[18px] p-[14px]">
      <Face name="card" radius={13} />
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">
            {progression.map((entry) => toAccidentalGlyphs(entry.symbol)).join('  ·  ')}
          </Text>
          <Text className="mt-[2px] text-[11px] leading-[15px] text-ink-faint">
            {caption ?? `${bpm} bpm, one chord per beat`}
          </Text>
        </View>
        <Button
          variant="primary"
          size="xs"
          square
          radius={999}
          icon={playing ? 'stop.fill' : 'play.fill'}
          hitSlop={8}
          accessibilityLabel={`${playing ? 'Stop' : 'Play'} the progression`}
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

      <View className="mt-[12px] flex-row flex-wrap gap-[6px]">
        {progression.map((entry, index) => (
          <ChordChip key={`${entry.symbol}-${index}`} entry={entry} sounding={at === index} />
        ))}
      </View>
    </View>
  );
}

/** Lays the strum out on the audio clock rather than the JS one, so it stays even. */
function strum(entry: ProgressionChord) {
  const start = now();
  entry.midis.forEach((midi, index) => pluck(midi, start + (index * STRUM_MS) / 1000));
}

/**
 * One chord, with the shape under its name — the grip is what makes this a guitar
 * block rather than a chord sequencer, so it is on the face of the chip.
 */
function ChordChip({ entry, sounding }: { entry: ProgressionChord; sounding: boolean }) {
  return (
    <View className="px-[10px] py-[6px]">
      <Face
        fill={sounding ? '--accent-wash' : '--surface-raised'}
        stroke={sounding ? '--accent' : '--line-soft'}
        radius={9}
      />
      <Text className={`text-[13px] font-semibold ${sounding ? 'text-accent' : 'text-ink'}`}>
        {toAccidentalGlyphs(entry.symbol)}
      </Text>
      <Text className="mt-[1px] font-mono text-[9px] tracking-[0.5px] text-ink-faint">
        {chartFor(entry.voicing.frets)}
      </Text>
    </View>
  );
}
