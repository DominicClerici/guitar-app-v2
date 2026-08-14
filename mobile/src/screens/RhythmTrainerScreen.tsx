import { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { MicGate } from '@/components/MicGate';
import { TransportButton } from '@/components/TransportButton';
import { tempoMarking, useTapTempo } from '@/features/bpm-finder';
import { TempoRail, TempoSteppers } from '@/features/metronome';
import {
  describeBias,
  describeHeadroom,
  describeScore,
  describeValues,
  presetFor,
  SlotGrid,
  StrikePad,
  TrainerSettingsSheet,
  useRhythmTrainer,
  type RhythmTrainer,
  type TrainerSettingsSheetRef,
} from '@/features/rhythm';
import { useToken } from '@/lib/tokens';

/**
 * The rhythm trainer: a written pattern, a click, and a running account of how close you are
 * playing to it.
 *
 * It is the pathway drill's engine with the drill taken off — no rounds, no summary, no end. The
 * pattern loops until you stop it, which is the shape of practising a rhythm rather than being
 * tested on one, and everything on the page can be changed while it runs: the tempo takes effect
 * on the next pass, the pattern on the one after you close the sheet.
 */
export function RhythmTrainerScreen() {
  const insets = useSafeAreaInsets();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const trainer = useRhythmTrainer();
  const tapTempo = useTapTempo();
  const sheet = useRef<TrainerSettingsSheetRef>(null);

  const { drill, settings } = trainer;
  const generating = settings.source.mode === 'generate';
  const tapping = settings.input === 'tap';

  // The reading arrives a render after the tap that produced it, so it is applied when it lands
  // rather than read back inside the handler that asked for it.
  const tapped = tapTempo.bpm;
  const { setBpm } = trainer;
  useEffect(() => {
    if (tapped !== null) setBpm(tapped);
  }, [tapped, setBpm]);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[44px] flex-row items-center gap-[4px] px-[18px]">
        <BackLink title="Rhythm Trainer" />

        {generating ? (
          <Button
            variant="ghost"
            size="inline"
            square
            icon="shuffle"
            hitSlop={10}
            className="ml-auto"
            accessibilityLabel="Compose another pattern"
            onPress={trainer.shuffle}
          />
        ) : null}

        <Button
          variant="ghost"
          size="inline"
          square
          icon="slider.horizontal.3"
          hitSlop={10}
          className={generating ? '' : 'ml-auto'}
          accessibilityLabel="Drill settings"
          onPress={() => sheet.current?.present()}
        />
      </View>

      <Gated on={trainer.running && settings.input === 'mic'}>
        {drill.phase.kind === 'calibrating' ? (
          <Centred>
            <ActivityIndicator color={muted} />
            <Text className="mt-[16px] font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              Calibrating
            </Text>
            <Text className="mt-[12px] text-center text-[13.5px] leading-[20px] text-ink-muted">
              Two bars of click, and quiet from you. This measures the room, how loud the click
              comes back through the microphone, and how long this phone takes to make a sound and
              hear it again. It happens once.
            </Text>
          </Centred>
        ) : drill.phase.kind === 'blocked' ? (
          <Centred>
            <Text className="text-center text-[17px] font-semibold tracking-[-0.3px] text-ink">
              Not enough room to hear you
            </Text>
            <Text className="mt-[10px] text-center text-[13.5px] leading-[20px] text-ink-muted">
              {describeHeadroom(drill.phase.reason)}
            </Text>
            <Text className="mt-[10px] text-center text-[13px] leading-[19px] text-ink-faint">
              Tapping the screen instead works anywhere, and needs none of this.
            </Text>

            <View className="mt-[22px] flex-row gap-[10px]">
              <Button
                variant="secondary"
                size="md"
                accessibilityLabel="Tap the screen instead"
                onPress={() => trainer.update({ input: 'tap' })}
              >
                Use taps
              </Button>
              <Button
                variant="primary"
                size="md"
                accessibilityLabel="Measure the room again"
                onPress={() => {
                  trainer.recalibrate();
                  trainer.toggle();
                }}
              >
                Try again
              </Button>
            </View>
          </Centred>
        ) : (
          <Body trainer={trainer} onTapTempo={tapTempo.tap} taps={tapTempo.taps} />
        )}
      </Gated>

      {tapping ? (
        <View className="h-[136px]">
          <StrikePad onStrike={drill.strike} idle={!trainer.running} />
        </View>
      ) : null}

      <View
        className="items-center border-t border-t-line-soft bg-bg pt-[14px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TransportButton running={trainer.running} what="rhythm trainer" onPress={trainer.toggle} />
      </View>

      <TrainerSettingsSheet
        ref={sheet}
        settings={settings}
        onChange={trainer.update}
        onRecalibrate={drill.calibration ? trainer.recalibrate : null}
      />
    </View>
  );
}

function Body({
  trainer,
  onTapTempo,
  taps,
}: {
  trainer: RhythmTrainer;
  onTapTempo: (at: number) => void;
  taps: number;
}) {
  const { drill, settings } = trainer;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-[18px] pt-[4px]"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Readout trainer={trainer} />

      <View className="mt-[18px]">
        <SlotGrid
          grid={trainer.grid}
          progress={drill.progress}
          marks={trainer.marks}
          verdicts={trainer.verdicts}
        />
      </View>

      <View className="mt-[16px] min-h-[46px]">
        <Status trainer={trainer} />
      </View>

      <View className="mt-[8px]">
        <TempoRail bpm={settings.bpm} onChange={trainer.setBpm} />
        <TempoSteppers onStep={trainer.nudge} onTap={onTapTempo} taps={taps} />
      </View>

      {settings.input === 'mic' && drill.calibration?.latencySource === 'nominal' ? (
        <Text className="mt-[16px] text-[12px] leading-[17px] text-ink-faint">
          The click never came back through the microphone — headphones, most likely — so the delay
          between hearing a click and being heard could not be measured. Early and late are judged
          against a typical value instead, and may sit a little to one side.
        </Text>
      ) : null}
    </ScrollView>
  );
}

/**
 * The gate over the reading surface, and only over it: the transport underneath stays live, so a
 * run held up by a permission dialog can still be stopped.
 */
function Gated({ on, children }: { on: boolean; children: React.ReactNode }) {
  if (!on) return children;

  return (
    <MicGate reason="This drill listens for the moment you pick, so it needs the microphone. Tapping the screen works instead.">
      {children}
    </MicGate>
  );
}

/** The tempo, what is being played at it, and how the run is going. */
function Readout({ trainer }: { trainer: RhythmTrainer }) {
  const { settings } = trainer;

  const what =
    settings.source.mode === 'preset'
      ? presetFor(settings.source.id).name
      : describeValues(settings.source.values);

  return (
    <View className="items-center">
      <View className="flex-row items-end">
        <Text className="text-[52px] font-semibold leading-[58px] tracking-[-1.8px] text-ink">
          {settings.bpm}
        </Text>
        <Text className="mb-[12px] ml-[6px] font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
          BPM
        </Text>
      </View>

      <Text className="mt-[2px] font-mono text-[9.5px] uppercase tracking-[2.5px] text-accent">
        {tempoMarking(settings.bpm)}
        {trainer.moved === 'up' ? ' · UP' : trainer.moved === 'down' ? ' · BACK' : ''}
      </Text>

      <Text className="mt-[7px] text-center text-[12.5px] leading-[17px] text-ink-muted">
        {what} · {trainer.grid.beatsPerBar} to a bar
      </Text>
    </View>
  );
}

/**
 * One slot, because the line under the grid has to say different things at different moments and
 * a screen that reflows between them is a screen that shifts under your eye mid-bar.
 */
function Status({ trainer }: { trainer: RhythmTrainer }) {
  const { drill, last, reviewing, running, passes, onTime, expected } = trainer;

  return (
    <>
      {reviewing && last ? (
        <>
          <Text className="text-[16px] font-semibold tracking-[-0.3px] text-ink">
            {describeScore(last)}
          </Text>
          <Text className="mt-[4px] text-[13px] leading-[19px] text-ink-muted">
            {describeBias(last.bias)}
          </Text>
        </>
      ) : (
        <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
          {drill.phase.kind === 'interrupted'
            ? 'Paused · the microphone stopped'
            : running
              ? drill.countingIn
                ? 'Count in'
                : 'Play'
              : 'Press play to begin'}
        </Text>
      )}

      {passes > 0 ? (
        <Text className="mt-[6px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
          {passes} pass{passes === 1 ? '' : 'es'} · {onTime} of {expected} on time
        </Text>
      ) : null}
    </>
  );
}

function Centred({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 items-center justify-center px-[32px]">{children}</View>;
}
