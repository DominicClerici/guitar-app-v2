import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconAction } from '@/components/IconAction';
import { Segmented } from '@/components/Segmented';
import { TransportButton } from '@/components/TransportButton';
import { Fretboard } from '@/features/chord-detection/Fretboard';
import {
  ControlShelf,
  DroneReadout,
  QualityPicker,
  RootRail,
  useDrone,
  voiceById,
  type DroneMode,
} from '@/features/drone';
import { useToken } from '@/lib/tokens';

const MODES: { id: DroneMode; label: string }[] = [
  { id: 'chords', label: 'Chords' },
  { id: 'neck', label: 'Neck' },
];

/**
 * A pitch held for as long as you want it. The screen reads top-down — what is
 * sounding, where the notes come from, how they should sound — with the
 * transport pinned at the bottom, because that is the one thing you reach for
 * while playing rather than while setting up.
 */
export function DroneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const drone = useDrone();
  const { board } = drone;

  const detail = [
    voiceById(drone.voiceId).label,
    drone.intonation === 'just' ? 'Pure' : 'Equal',
  ];

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[42px] flex-row items-center px-[18px]">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="-ml-[4px] flex-row items-center gap-[6px] py-[6px] pr-[8px] active:opacity-60"
        >
          <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
          <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">Drone</Text>
        </Pressable>
      </View>

      <View className="px-[18px]">
        <DroneReadout
          selection={drone.selection}
          running={drone.running}
          detail={detail}
          hint="Tap the neck to build a shape"
        />
      </View>

      {/* The mode sits centred and the neck's one action hangs off the right of
          the same row, so choosing where the notes come from never shifts. */}
      <View className="mt-[6px] h-[50px] flex-row items-center justify-center px-[18px]">
        <Segmented
          segments={MODES.map((mode) => ({
            id: mode.id,
            label: `Pick notes from the ${mode.label.toLowerCase()}`,
            content: (
              <Text
                className={`text-[12.5px] font-medium tracking-[-0.1px] ${
                  mode.id === drone.mode ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {mode.label}
              </Text>
            ),
          }))}
          value={drone.mode}
          onChange={(id) => drone.setMode(id as DroneMode)}
        />

        {drone.mode === 'neck' ? (
          <View className="absolute right-[18px]">
            <IconAction
              symbol="arrow.counterclockwise"
              label="Clear board"
              disabled={board.placed.length === 0}
              onPress={board.clear}
            />
          </View>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[16px] pb-[16px]"
      >
        {drone.mode === 'chords' ? (
          <View className="gap-[12px]">
            <RootRail root={drone.root} onChange={drone.setRoot} />
            <QualityPicker quality={drone.quality} onChange={drone.setQuality} />
          </View>
        ) : null}

        <View className={drone.mode === 'chords' ? 'mt-[18px] px-[18px]' : 'px-[18px]'}>
          <ControlShelf
            voiceId={drone.voiceId}
            intonation={drone.intonation}
            octave={drone.octave}
            onVoice={drone.setVoiceId}
            onIntonation={drone.setIntonation}
            onOctave={drone.setOctave}
          />
        </View>
      </ScrollView>

      {/* Pinned rather than scrolled, and on the tray rather than the page: the
          neck is the instrument here, and it has to stay under the thumb while
          everything above it moves. */}
      {drone.mode === 'neck' ? (
        <View className="border-t border-t-line-soft bg-tray pb-[8px] pt-[4px]">
          <Fretboard
            placed={board.placed}
            rootPitchClass={board.rootPitchClass}
            nameForPitchClass={board.nameForPitchClass}
            onToggle={board.toggle}
            veilToken="--tray"
          />
        </View>
      ) : null}

      <View
        className="items-center border-t border-t-line-soft bg-bg pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TransportButton
          running={drone.running}
          what="drone"
          disabled={!drone.ready}
          onPress={drone.toggle}
        />
      </View>
    </View>
  );
}
