import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { TransportButton } from '@/components/TransportButton';
import { Fretboard } from '@/features/chord-detection/Fretboard';
import { QualityPicker, QualitySelect, RootGrid, type ExtraGroup } from '@/features/chord-picker';
import {
  ControlShelf,
  DroneReadout,
  DroneWave,
  NeckToggle,
  NoteRow,
  SINGLE_NOTE,
  useDrone,
  type DroneHandoff,
} from '@/features/drone';
import { decodeVoicing } from '@/lib/voicing-param';

/** Only the drone can hold a bare pitch, so only the drone offers this group. */
const NOTE_GROUP: ExtraGroup = {
  id: SINGLE_NOTE,
  label: 'Single Note',
};

/**
 * A pitch held for as long as you want it. What is sounding is named at the top
 * and drawn under it; what chooses it sits at the bottom, under the thumb, with
 * the transport. The catalogue is a sheet rather than a shelf on the page —
 * thirty qualities are worth one tap and not a third of the screen.
 *
 * A `voicing` param is a shape sent over from the chord detector: the screen opens
 * on the neck holding it and, with `play`, already sounding it.
 */
export function DroneScreen() {
  const insets = useSafeAreaInsets();
  const catalogue = useRef<SheetRef>(null);

  const { voicing, root, play } = useLocalSearchParams<{
    voicing?: string;
    root?: string;
    play?: string;
  }>();

  // Read once and held: the drone takes it as initial state, and a new object on
  // every render would say the handoff had changed when nothing had.
  const handoff = useMemo<DroneHandoff | undefined>(() => {
    const placed = decodeVoicing(voicing);
    if (placed.length === 0) return undefined;

    const rootPitchClass = Number(root);
    return {
      placed,
      rootPitchClass: Number.isInteger(rootPitchClass) ? rootPitchClass : undefined,
      autoStart: play === '1',
    };
  }, [voicing, root, play]);

  const drone = useDrone(handoff);
  const { board } = drone;
  const onNeck = drone.mode === 'neck';

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[44px] flex-row items-center px-[18px]">
        <BackLink title="Drone" />
      </View>

      <View className="px-[18px] pt-[14px]">
        <DroneReadout selection={drone.selection} running={drone.running} />
      </View>

      <View className="min-h-0 flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="grow px-[18px] pb-[10px] pt-[18px]"
        >
          <ControlShelf
            voiceId={drone.voiceId}
            intonation={drone.intonation}
            octave={drone.octave}
            onVoice={drone.setVoiceId}
            onIntonation={drone.setIntonation}
            onOctave={drone.setOctave}
          />

          {/* The band takes whatever is left between the card and the notes and
              sits centred in it, edge to edge. It keeps a floor of its own so a
              screen too short for both scrolls rather than squeezing the wave to
              a ribbon. */}
          <View className="-mx-[18px] min-h-[124px] grow justify-center">
            <DroneWave
              pitches={drone.selection.pitches}
              rootMidi={drone.selection.rootMidi}
              voiceId={drone.voiceId}
              intonation={drone.intonation}
              running={drone.running}
            />
          </View>
        </ScrollView>
      </View>

      {onNeck ? (
        /* Pinned rather than scrolled, and on the tray rather than the page: the
           neck is the instrument here, and it has to stay under the thumb. What
           it is holding is named directly above it. */
        <View className="border-t border-t-line-soft bg-tray pb-[8px] pt-[6px]">
          <View className="h-[42px] flex-row items-center gap-[12px] px-[18px]">
            <NoteRow selection={drone.selection} hint="Tap the neck to build a shape" />
            <Button
              variant="secondary"
              size="sm"
              square
              radius={10}
              icon="arrow.counterclockwise"
              disabled={board.placed.length === 0}
              accessibilityLabel="Clear board"
              onPress={board.clear}
            />
          </View>

          <Fretboard
            placed={board.placed}
            rootPitchClass={board.rootPitchClass}
            nameForPitchClass={board.nameForPitchClass}
            onToggle={board.toggle}
            veilToken="--tray"
          />
        </View>
      ) : (
        <View className="gap-[10px] px-[18px] pb-[14px] pt-[10px]">
          <QualitySelect
            quality={drone.quality}
            extraGroup={NOTE_GROUP}
            onPress={() => catalogue.current?.present()}
          />
          <RootGrid root={drone.root} onChange={drone.setRoot} />
        </View>
      )}

      {/* The transport stays centred whether or not the neck key is beside it —
          it is the one thing pressed without looking, so it cannot move. */}
      <View
        className="items-center justify-center border-t border-t-line-soft bg-bg pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TransportButton
          running={drone.running}
          what="drone"
          disabled={!drone.ready}
          onPress={drone.toggle}
        />

        <View className="absolute bottom-0 right-[18px] top-0 justify-center">
          <NeckToggle active={onNeck} onPress={() => drone.setMode(onNeck ? 'chords' : 'neck')} />
        </View>
      </View>

      {/* Left open after a pick on purpose: the drone re-voices under your
          finger, so the catalogue is somewhere you audition from rather than a
          menu you close behind you. */}
      <Sheet ref={catalogue}>
        <View className="pt-[10px]" style={{ paddingBottom: insets.bottom + 18 }}>
          <QualityPicker
            quality={drone.quality}
            onChange={drone.setQuality}
            extraGroup={NOTE_GROUP}
          />
        </View>
      </Sheet>
    </View>
  );
}
