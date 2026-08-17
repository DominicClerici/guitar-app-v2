import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { PillSelector, type PillOption } from '@/components/PillSelector';
import { RootRail } from '@/features/chord-picker';
import {
  ExpandedNeck,
  NeckStrip,
  RelatedScales,
  ScaleHeading,
  ScaleNeck,
  ScalePicker,
  ScaleSummary,
  useScaleVisualizer,
  type LabelMode,
} from '@/features/scale-visualizer';
import { SYSTEM_LABELS, type PositionSystem } from '@/lib/guitar-positions';

const LABEL_MODES: PillOption[] = [
  { id: 'notes', label: 'Notes', name: 'Note names' },
  { id: 'degrees', label: 'Degrees', name: 'Scale degrees' },
  { id: 'intervals', label: 'Intervals', name: 'Intervals from the root' },
];

/**
 * Any scale, anywhere on the neck. The heading, the neck and its strip are pinned
 * and the pickers scroll under them, because the point of the tool is watching the
 * board change as you choose — a neck that scrolled away exactly when you reached
 * for a scale would be the wrong way round.
 *
 * The full-screen neck is a sibling of the padded page rather than a child of it,
 * so it covers the safe areas too.
 */
export function ScaleVisualizerScreen() {
  const insets = useSafeAreaInsets();

  const view = useScaleVisualizer();

  const systemOptions: PillOption[] = view.systems.map((system) => ({
    id: system,
    label: SYSTEM_LABELS[system],
    name: `${SYSTEM_LABELS[system]} positions`,
  }));

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <View className="h-[42px] flex-row items-center px-[18px]">
          <BackLink title="Scale Visualizer" />
        </View>

        <View className="pt-[6px]">
          <ScaleHeading scale={view.scale} />
        </View>

        <View className="mt-[14px]">
          <ScaleNeck
            cells={view.cells}
            hue={view.hue}
            position={view.position}
            soundingKey={view.soundingKey}
            onPressNote={view.soundAt}
          />
        </View>

        <View className="mt-[10px]">
          <NeckStrip
            positions={view.positions}
            position={view.position}
            playing={view.playing}
            onStep={view.stepPosition}
            onAll={() => view.setPosition(null)}
            onTogglePlay={view.togglePlay}
            onExpand={() => view.setExpanded(true)}
          />
        </View>

        <ScrollView
          className="mt-[24px] flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <RootRail root={view.root} onChange={view.setRoot} />

          <View className="mt-[16px]">
            <ScalePicker scaleId={view.scaleId} onChange={view.setScale} />
          </View>

          <View className="mt-[20px] gap-[12px] px-[18px]">
            <ControlRow label="Labels">
              <PillSelector
                options={LABEL_MODES}
                value={view.labelMode}
                onChange={(id) => view.setLabelMode(id as LabelMode)}
                label="Neck labels"
                className="w-2/3"
              />
            </ControlRow>

            {view.systems.length > 1 ? (
              <ControlRow label="Positions">
                <PillSelector
                  options={systemOptions}
                  value={view.system}
                  onChange={(id) => view.setSystem(id as PositionSystem)}
                  label="Position system"
                  className="w-2/3"
                />
              </ControlRow>
            ) : (
              <Text className="text-[11.5px] leading-[16px] text-ink-muted">
                Five boxes — three-per-string needs a seven-note scale.
              </Text>
            )}
          </View>

          <View className="mt-[22px]">
            <ScaleSummary scale={view.scale} />
          </View>

          <View className="mt-[30px]">
            <RelatedScales related={view.related} onPick={view.goTo} />
          </View>
        </ScrollView>
      </View>

      {view.expanded ? (
        <ExpandedNeck
          scale={view.scale}
          cells={view.cells}
          hue={view.hue}
          position={view.position}
          soundingKey={view.soundingKey}
          onPressNote={view.soundAt}
          onClose={() => view.setExpanded(false)}
        />
      ) : null}
    </View>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-[12px]">
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-ink-faint">
        {label}
      </Text>
      {children}
    </View>
  );
}
