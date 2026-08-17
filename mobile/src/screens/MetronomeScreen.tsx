import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { tempoMarking } from '@/features/bpm-finder';
import { TransportButton } from '@/components/TransportButton';
import {
  BeatRow,
  ControlsStrip,
  TempoRail,
  TempoSteppers,
  useMetronome,
} from '@/features/metronome';

/**
 * The metronome. The bar reads top-down: what the click is doing, how fast, and how
 * to change it — with the transport pinned where your thumb already is.
 *
 * A `bpm` param is a tempo sent over from the BPM finder; the screen opens set to
 * it, and to defaults for everything else.
 */
export function MetronomeScreen() {
  const insets = useSafeAreaInsets();

  const { bpm: bpmParam } = useLocalSearchParams<{ bpm?: string }>();
  const handedBpm = Number(bpmParam);

  const metronome = useMetronome(
    Number.isFinite(handedBpm) && handedBpm > 0 ? handedBpm : undefined,
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[42px] flex-row items-center px-[18px]">
        <BackLink title="Metronome" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[10px]"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <BeatRow
          pattern={metronome.pattern}
          beatSV={metronome.beatSV}
          tickSV={metronome.tickSV}
          onCycle={metronome.cycleBeat}
        />

        {/* Fixed slot: the hint going away as the click starts must not lift the
            tempo off the page. */}
        <View className="h-[16px] justify-center">
          {metronome.running ? null : (
            <Text className="text-center font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
              Tap a beat to accent or mute it
            </Text>
          )}
        </View>

        <View className="mt-[14px] items-center">
          <View className="flex-row items-end">
            <Text className="text-[76px] font-semibold leading-[82px] tracking-[-2.5px] text-ink">
              {metronome.bpm}
            </Text>
            <Text className="mb-[17px] ml-[7px] font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">
              BPM
            </Text>
          </View>
          <Text className="mt-[2px] font-mono text-[10.5px] uppercase tracking-[3px] text-accent">
            {tempoMarking(metronome.bpm)}
          </Text>
        </View>

        <View className="mt-[20px]">
          <TempoRail bpm={metronome.bpm} onChange={metronome.setBpm} />
          <TempoSteppers onStep={metronome.nudge} onTap={metronome.tap} taps={metronome.taps} />
        </View>

        <View className="mt-[22px]">
          <ControlsStrip
            beats={metronome.beats}
            perBeat={metronome.perBeat}
            voiceId={metronome.voiceId}
            onBeats={metronome.setBeats}
            onPerBeat={metronome.setPerBeat}
            onVoice={metronome.setVoiceId}
          />
        </View>
      </ScrollView>

      <View
        className="items-center border-t border-t-line-soft bg-bg pt-[14px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TransportButton running={metronome.running} what="metronome" onPress={metronome.toggle} />
      </View>
    </View>
  );
}
