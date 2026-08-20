import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import { pluck, prepare, release } from '@/features/scale-visualizer';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { isRootName, type RootName } from '@/lib/chord-library';
import {
  buildScale,
  maskOf,
  noteToPitchClass,
  scaleTypeById,
  type Scale,
} from '@/lib/scale-library';

import { claimPlayback, releasePlayback } from '../playbackBus';
import { useDroneHold, type DroneHold } from './useDroneHold';

// Live block `scale-compare`: one card per scale on the same root, each with a
// play button and its tones as chips. The first scale is the reference — tones
// a later scale has that the reference doesn't are tinted amber, which is the
// whole "how do these relate" story told in colour. The sounding chip lights
// as a run plays. Every chip is tappable, so a single tone can be heard on its
// own rather than only in passing.
//
// `drone` is what a modal lesson needs and a scale run alone cannot give it.
// A scale played unaccompanied has no tonal centre — run the notes of C major
// from D and the ear still hears C major, which is exactly why "a mode is the
// scale started somewhere else" fails as a teaching line. Holding the root
// underneath supplies the home the mode is measured against, and then tapping
// one chip is the whole lesson: this is the note that makes it sound like this.

export const scaleComparePropsSchema = z.object({
  root: z.string().refine(isRootName, 'not a root the scale library can spell'),
  scales: z.array(z.string()).min(1).max(4),
  /** Offers a sustained root to hear the tones against. Off by default. */
  drone: z.boolean().default(false),
});

export type ScaleCompareProps = z.infer<typeof scaleComparePropsSchema>;

/** One fixed practice speed, matching the scale visualizer's feel. */
const STEP_MS = 340;

/** Root pitches land in A2..G#3 — the register a guitar actually plays them. */
function baseMidiFor(root: RootName): number {
  return 45 + ((noteToPitchClass(root) - 9 + 12) % 12);
}

/**
 * The drone sits an octave under the run, so the tones are heard *over* a root
 * rather than tangled with it — a b2 a semitone from the drone in the same
 * octave beats against it and the beating is what you hear instead of the lean.
 */
const DRONE_DROP = 12;

/** The run a card plays: every tone ascending, then the octave. */
function midisFor(scale: Scale, base: number): number[] {
  return [...scale.type.semitones.map((semitone) => base + semitone), base + 12];
}

export function ScaleCompare({ root, scales: scaleIds, drone }: ScaleCompareProps) {
  const scales = scaleIds
    .filter((id) => scaleTypeById(id) !== undefined)
    .map((id) => buildScale(root as RootName, id));

  const hold = useDroneHold(baseMidiFor(root as RootName) - DRONE_DROP);

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlayingIndex(null);
  }, []);

  const play = (index: number, midis: number[]) => {
    stop();
    claimPlayback(stop);
    void prepare();
    setPlayingIndex(index);
    setStep(0);

    let at = 0;
    const tick = () => {
      if (at >= midis.length) {
        stop();
        releasePlayback(stop);
        return;
      }
      pluck(midis[at]);
      setStep(at);
      at += 1;
    };

    tick();
    timer.current = setInterval(tick, STEP_MS);
  };

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      releasePlayback(stop);
      release();
    },
    [stop],
  );

  if (!scales.length) return null;

  const base = baseMidiFor(root as RootName);
  const referenceMask = maskOf(scales[0]);

  const soundTone = (semitone: number) => {
    void prepare();
    pluck(base + semitone);
  };

  return (
    <View className="mt-[18px] gap-[10px]">
      {drone ? <DroneBar root={root} hold={hold} /> : null}

      {scales.map((scale, index) => (
        <ScaleCard
          key={scale.type.id}
          scale={scale}
          referenceMask={index === 0 ? null : referenceMask}
          playing={playingIndex === index}
          soundingChip={playingIndex === index ? step % scale.notes.length : null}
          onTone={soundTone}
          onToggle={() => {
            if (playingIndex === index) {
              stop();
              releasePlayback(stop);
            } else {
              play(index, midisFor(scale, base));
            }
          }}
        />
      ))}
    </View>
  );
}

/**
 * The held root, above the cards it is heard under. Deliberately worded as an
 * instruction rather than a label: the point a modal lesson is making is that
 * the tones mean nothing until something is holding home.
 */
function DroneBar({ root, hold }: { root: string; hold: DroneHold }) {
  return (
    <View className="flex-row items-center justify-between px-[14px] py-[10px]">
      <Face name="key" radius={13} />
      <View className="flex-1 pr-[10px]">
        <Text className="text-[13px] font-medium tracking-[-0.2px] text-ink">
          {`Hold ${toAccidentalGlyphs(root)} underneath`}
        </Text>
        <Text className="mt-[2px] text-[11px] leading-[15px] text-ink-faint">
          {hold.holding
            ? 'Tap any tone to hear it against home'
            : 'The tones need a home to lean on'}
        </Text>
      </View>
      <Button
        variant={hold.holding ? 'primary' : 'secondary'}
        size="xs"
        square
        radius={999}
        icon={hold.holding ? 'stop.fill' : 'play.fill'}
        hitSlop={8}
        accessibilityLabel={`${hold.holding ? 'Stop' : 'Start'} the ${root} drone`}
        onPress={hold.toggle}
      />
    </View>
  );
}

function ScaleCard({
  scale,
  referenceMask,
  playing,
  soundingChip,
  onTone,
  onToggle,
}: {
  scale: Scale;
  /** Mask of the first card's tones, or null when this card is the reference. */
  referenceMask: number | null;
  playing: boolean;
  soundingChip: number | null;
  /** Sounds one tone alone, by its semitones above the root. */
  onTone: (semitone: number) => void;
  onToggle: () => void;
}) {
  const name = `${toAccidentalGlyphs(scale.root)} ${scale.type.name}`;

  return (
    <View className="p-[14px]">
      <Face name="card" radius={13} />
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">{name}</Text>
          <Text className="mt-[2px] text-[11px] leading-[15px] text-ink-faint">
            {scale.type.character}
          </Text>
        </View>
        <Button
          variant="primary"
          size="xs"
          square
          radius={999}
          icon={playing ? 'stop.fill' : 'play.fill'}
          hitSlop={8}
          accessibilityLabel={`${playing ? 'Stop' : 'Play'} the ${name} scale`}
          onPress={onToggle}
        />
      </View>

      <View className="mt-[12px] flex-row flex-wrap gap-[6px]">
        {scale.notes.map((note, index) => {
          const sounding = soundingChip === index;
          const differs =
            referenceMask !== null && !(referenceMask & (1 << scale.pitchClasses[index]));

          return (
            <Pressable
              key={index}
              className="min-w-[36px] items-center px-[7px] py-[5px]"
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={`Sound ${note}, the ${scale.type.degrees[index]}`}
              onPress={() => onTone(scale.type.semitones[index])}
            >
              <Face fill={sounding ? '--accent' : '--surface-raised'} radius={8} />
              <Text
                className={`text-[13px] font-medium ${
                  sounding ? 'text-on-accent' : differs ? 'text-amber' : 'text-ink'
                }`}
              >
                {toAccidentalGlyphs(note)}
              </Text>
              <Text
                className={`mt-[1px] font-mono text-[8.5px] ${
                  sounding ? 'text-on-accent' : 'text-ink-faint'
                }`}
              >
                {toAccidentalGlyphs(scale.type.degrees[index])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
