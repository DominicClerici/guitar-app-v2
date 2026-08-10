import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { claimPlayback, releasePlayback } from '@/features/articles/playbackBus';
import { pluck, prepare, release } from '@/features/scale-visualizer';
import type { AudioSpec } from '@/lib/content';
import { midisFromPitchNames } from '@/lib/quiz';
import { useToken } from '@/lib/tokens';

// The sounding half of a `listen` question. It plays through the app's shared pluck engine — the
// same voice the scale visualizer and the article live blocks use — and coordinates through
// `playbackBus`, so starting it silences anything else that was making noise.

/** Gap between notes when the author didn't name one. Slow enough to hear each note land. */
const DEFAULT_TEMPO_MS = 420;
/** How long a struck chord is left to ring before the button offers to play it again. */
const CHORD_RING_MS = 1_100;

/**
 * Notes are struck as their turn comes rather than scheduled in advance, exactly as `usePlayScale`
 * does. That costs a little onset accuracy — inaudible at this tempo — and buys a stop button that
 * stops, instead of one that leaves the rest of the phrase to play itself out.
 */
export function ListenControl({ audio }: { audio: AudioSpec }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onAccent = useToken('--on-accent', '#04211f');

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    const midis = midisFromPitchNames(audio.notes);
    if (!midis.length) return;

    stop();
    claimPlayback(stop);
    void prepare();
    setPlaying(true);

    // A chord is one step holding every note; a sequence is one step per note. Modelling both as
    // steps means the same timer both plays the phrase and ends it.
    const steps = audio.mode === 'chord' ? [midis] : midis.map((midi) => [midi]);
    const stepMs = audio.mode === 'chord' ? CHORD_RING_MS : (audio.tempoMs ?? DEFAULT_TEMPO_MS);

    let at = 0;
    const tick = () => {
      if (at >= steps.length) {
        stop();
        releasePlayback(stop);
        return;
      }
      for (const midi of steps[at]) pluck(midi);
      at += 1;
    };

    tick();
    timer.current = setInterval(tick, stepMs);
  }, [audio, stop]);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      releasePlayback(stop);
      release();
    },
    [stop],
  );

  const label = audio.mode === 'chord' ? 'Hear the chord' : 'Hear the phrase';

  return (
    <Pressable
      onPress={playing ? stop : play}
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Stop playback' : label}
      className="mt-[16px] flex-row items-center gap-[12px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface px-[14px] py-[13px] active:opacity-70"
    >
      <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-accent">
        <SymbolView
          name={playing ? 'stop.fill' : 'play.fill'}
          size={13}
          tintColor={onAccent}
          style={playing ? undefined : { marginLeft: 2 }}
        />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">{label}</Text>
        <Text className="mt-[2px] text-[11.5px] leading-[16px] text-ink-faint">
          Play it as many times as you need.
        </Text>
      </View>
    </Pressable>
  );
}
