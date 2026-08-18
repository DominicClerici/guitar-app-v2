import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { FadingHScroll } from '@/components/FadingHScroll';
import { Segmented, type Segment } from '@/components/Segmented';
import { ChipFace } from '@/features/key-detection/ChipFace';
import { useKeyDetection, type DisplayChord } from '@/features/key-detection/useKeyDetection';
import { scaleLabel } from '@/features/scale-explorer/scaleLabel';
import { pluck, prepare, ScaleNeck, type Cell } from '@/features/scale-visualizer';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { useTuning } from '@/lib/preferences';
import type { ExceptionSpan, NoteDelta, ScalePlan } from '@/lib/scale-analysis';
import { soundingMidi } from '@/lib/tuning';

type Lens = 'pentatonic' | 'scale' | 'blues';

const EM_DASH = '—';

function deltaText(deltas: readonly NoteDelta[]): string {
  return deltas
    .map((d) =>
      d.fromName
        ? `${toAccidentalGlyphs(d.fromName)} → ${toAccidentalGlyphs(d.toName)}`
        : `add ${toAccidentalGlyphs(d.toName)}`,
    )
    .join(' · ');
}

function spanAt(plan: ScalePlan, index: number): ExceptionSpan | undefined {
  return plan.exceptions.find((span) => index >= span.start && index <= span.end);
}

/**
 * "What to play" for the progression on the key detector: the recommended scale
 * drawn across the whole neck, a lens toggle between the pentatonic and the
 * full scale (and the blues scale when the progression earns it), and the
 * chords underneath — tap one to light its chord tones as target notes and see
 * the note swaps where the scale bends around it.
 *
 * Read-only end to end: editing stays on the detector, one pop away. The
 * progression itself comes from the session cache both screens share; only the
 * chosen key needs to travel, so it rides the route params.
 */
export function ScaleExplorerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tuning = useTuning();

  const { tonic, mode } = useLocalSearchParams<{ tonic?: string; mode?: string }>();
  const { chords, estimate, labels, scalePlan, displayedKey, keyChoice, setKeyChoice } =
    useKeyDetection();

  // A fresh hook instance wakes up on the estimate's best key; the detector may
  // have been showing a runner-up. Adopt the key the route asked for, the same
  // adjust-during-render way the hook itself resets a stale choice.
  const targetIndex = estimate.candidates.findIndex(
    (candidate) => String(candidate.tonicPc) === tonic && candidate.mode === mode,
  );
  if (targetIndex >= 0 && targetIndex !== keyChoice) setKeyChoice(targetIndex);

  const [chosenLens, setChosenLens] = useState<Lens | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  if (!scalePlan || !displayedKey) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <Header onBack={() => router.back()} />
        <View className="px-[18px] pt-[10px]">
          <Text className="text-[12.5px] leading-[18px] text-ink-muted">
            Build a progression in the key detector first — the scales to play over it show up here.
          </Text>
        </View>
      </View>
    );
  }

  const plan = scalePlan;
  const bluesScale = plan.blues;
  const requested = chosenLens ?? (plan.pentatonic.survives ? 'pentatonic' : 'scale');
  const lens: Lens = requested === 'blues' && !bluesScale ? 'scale' : requested;
  const tonicPc = displayedKey.tonicPc;

  const selectedChord: DisplayChord | undefined = selected === null ? undefined : chords[selected];
  const selectedPcs = new Set(
    selectedChord?.readings[selectedChord.readingIndex]?.pitchClasses ?? [],
  );
  const selectedSpan = selected === null ? undefined : spanAt(plan, selected);
  const selectedClash = selected !== null && plan.pentatonic.clashes.includes(selected);

  // What the neck draws. The full-scale lens follows the selection into an
  // exception span — the board itself shows the swapped notes — while the
  // pentatonic and blues lenses hold still and the callout does the talking.
  const shownTones =
    lens === 'pentatonic'
      ? plan.pentatonic.scale.pitchClasses.map((pc, i) => ({
          pc,
          name: plan.pentatonic.scale.notes[i],
        }))
      : lens === 'blues' && bluesScale
        ? bluesScale.pitchClasses.map((pc, i) => ({ pc, name: bluesScale.notes[i] }))
        : selectedSpan
          ? selectedSpan.tones
          : plan.global.pitchClasses.map((pc, i) => ({ pc, name: plan.global.notes[i] }));

  const rootPc = lens === 'scale' ? tonicPc : plan.pentatonic.scale.pitchClasses[0];

  const cells = new Map<number, Cell>();
  for (const tone of shownTones) {
    cells.set(tone.pc, {
      label: tone.name,
      tone: tone.pc === rootPc ? 'root' : selectedPcs.has(tone.pc) ? 'accent' : 'plain',
    });
  }

  const lensSegments: Segment[] = [
    lensSegment('pentatonic', 'Pentatonic', lens),
    lensSegment('scale', 'Full scale', lens),
    ...(bluesScale ? [lensSegment('blues', 'Blues', lens)] : []),
  ];

  const headline =
    lens === 'pentatonic'
      ? plan.pentatonic.scale
      : lens === 'blues' && bluesScale
        ? bluesScale
        : plan.global;
  const spots = plan.exceptions.length;
  const subtitle =
    lens === 'pentatonic'
      ? plan.pentatonic.alias
        ? `Same five notes as ${scaleLabel(plan.pentatonic.alias)}`
        : plan.pentatonic.survives
          ? 'Works over the whole progression'
          : 'Rubs against some chords — see below'
      : lens === 'blues'
        ? 'The blue note passing between 4 and 5'
        : spots === 0
          ? 'Covers every chord in the progression'
          : `Bends around ${spots === 1 ? 'one spot' : `${spots} spots`} — tap the chords below`;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <Header onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-[18px] pt-[2px]">
          <View className="rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[16px]">
            <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
              Play over this progression
            </Text>
            <Text className="mt-[10px] text-[24px] leading-[28px] font-semibold tracking-[-0.6px] text-ink">
              {scaleLabel(headline)}
            </Text>
            <Text className="mt-[6px] text-[12.5px] leading-[18px] text-ink-muted">{subtitle}</Text>

            <View className="mt-[14px] self-start">
              <Segmented
                segments={lensSegments}
                value={lens}
                onChange={(id) => setChosenLens(id as Lens)}
              />
            </View>
          </View>
        </View>

        <View className="mt-[16px]">
          <ScaleNeck
            cells={cells}
            hue="amber"
            position={null}
            soundingKey={null}
            onPressNote={(string, fret) => {
              void prepare();
              pluck(soundingMidi(tuning, string, fret));
            }}
          />
        </View>

        <View className="mt-[14px]">
          <FadingHScroll contentClassName="flex-row gap-[8px] px-[18px]" fadeClassName="w-[26px]">
            {chords.map((chord, index) => (
              <Pressable
                key={chord.id}
                onPress={() => setSelected(selected === index ? null : index)}
                accessibilityRole="button"
                accessibilityState={{ selected: index === selected }}
                accessibilityLabel={
                  index === selected
                    ? `${chord.name}, selected. Tap to clear.`
                    : `${chord.name}. Tap to light its chord tones on the neck.`
                }
                className="active:opacity-70"
              >
                <ChipFace
                  chord={chord}
                  label={labels[index]}
                  position={index + 1}
                  reordering={false}
                  active={index === selected}
                />
              </Pressable>
            ))}
          </FadingHScroll>
        </View>

        {/* The callout speaks for the selected chord; without one it stays out of
            the way rather than repeating the card's subtitle. */}
        {selectedChord ? (
          <View className="mt-[12px] px-[18px]">
            {lens === 'scale' && selectedSpan ? (
              <Callout tone="amber">
                {`Over ${toAccidentalGlyphs(selectedChord.name)}: ${deltaText(selectedSpan.deltas)}${
                  selectedSpan.scale ? `  ·  = ${scaleLabel(selectedSpan.scale)}` : ''
                }`}
              </Callout>
            ) : lens !== 'scale' && selectedClash ? (
              <Callout tone="amber">
                {`${toAccidentalGlyphs(selectedChord.name)} rubs against this pentatonic — switch to the full scale for the fix`}
              </Callout>
            ) : (
              <Callout tone="plain">
                {`${toAccidentalGlyphs(selectedChord.name)} chord tones highlighted — land on these`}
              </Callout>
            )}
          </View>
        ) : null}

        {plan.exceptions.length > 0 ? (
          <View className="mt-[22px] gap-[8px] px-[20px]">
            <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
              Where the scale bends
            </Text>
            {plan.exceptions.map((span) => (
              <View key={span.start} className="flex-row items-center gap-[8px]">
                <View className="h-[7px] w-[7px] rounded-full bg-amber" />
                <Text
                  className="flex-1 text-[12.5px] leading-[18px] text-ink-muted"
                  numberOfLines={2}
                >
                  <Text className="font-semibold text-ink">
                    {chords
                      .slice(span.start, span.end + 1)
                      .map((c) => toAccidentalGlyphs(c.name))
                      .join(' – ') || EM_DASH}
                  </Text>
                  {`  ${deltaText(span.deltas)}${span.scale ? `  ·  ${scaleLabel(span.scale)}` : ''}`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="h-[42px] flex-row items-center px-[18px]">
      <BackLink title="What to play" onPress={onBack} />
    </View>
  );
}

function lensSegment(id: Lens, label: string, current: Lens): Segment {
  return {
    id,
    label: `Show the ${label.toLowerCase()}`,
    content: (
      <Text
        className={`font-mono text-[10px] font-semibold uppercase tracking-[1.2px] ${
          id === current ? 'text-accent' : 'text-ink-muted'
        }`}
      >
        {label}
      </Text>
    ),
  };
}

function Callout({ tone, children }: { tone: 'amber' | 'plain'; children: string }) {
  return (
    <Text
      className={`font-mono text-[9.5px] uppercase tracking-[1.5px] ${
        tone === 'amber' ? 'text-amber' : 'text-ink-muted'
      }`}
    >
      {children}
    </Text>
  );
}
