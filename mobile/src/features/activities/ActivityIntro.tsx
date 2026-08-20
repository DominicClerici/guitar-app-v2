import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import type { ActivityMode } from '@/lib/content';

// The card an activity opens on: what it is, how it works, and the one tap that starts it.
//
// That tap is the point of this component existing at all. Every activity here listens, and the
// microphone prompt should arrive attached to a gesture the learner just made and understood —
// so the runner acquires the mic from `onStart`, never on mount, where the prompt would land
// before the learner had read what it was for.

/**
 * How the two difficulties are named to the learner. The schema's own words — 'easy' and 'hard' —
 * describe the exercise from the author's side; what changes for the player is whether the answer
 * is on the screen, so that is what the labels say.
 */
const MODE_LABEL: Record<ActivityMode, string> = {
  easy: 'Guided',
  hard: 'From memory',
};

const MODE_HINT: Record<ActivityMode, string> = {
  easy: 'The answer stays on screen while you play it.',
  hard: 'Nothing is shown — work from the prompt alone.',
};

export interface ModeChoice {
  /** The difficulties the author offers, in the order they are shown. */
  options: readonly ActivityMode[];
  selected: ActivityMode;
  onSelect: (mode: ActivityMode) => void;
}

export function ActivityIntro({
  title,
  summary,
  modes,
  startLabel = 'Start',
  onStart,
  children,
}: {
  title: string;
  summary?: string;
  /**
   * The activity's own instructions — how this particular exercise is played. Everything above the
   * Start button that is not the title, the summary or the picker belongs here, which is what lets
   * one intro serve two runners that explain themselves very differently.
   */
  children?: ReactNode;
  /** Omitted by an activity that offers no choice of difficulty. */
  modes?: ModeChoice;
  startLabel?: string;
  onStart: () => void;
}) {
  const insets = useSafeAreaInsets();

  // One option is not a choice, and showing a picker with a single locked-on chip would read as a
  // control that has stopped working.
  const picker = modes && modes.options.length > 1 ? modes : null;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[10px]"
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-accent">
          Practice
        </Text>
        <Text className="mt-[8px] text-[26px] font-semibold leading-[32px] tracking-[-0.6px] text-ink">
          {title}
        </Text>
        {summary ? (
          <Text className="mt-[8px] text-[13.5px] leading-[20px] text-ink-muted">{summary}</Text>
        ) : null}

        {children ? <View className="mt-[20px]">{children}</View> : null}

        {picker ? (
          <View className="mt-[22px]">
            <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              Difficulty
            </Text>
            <View className="mt-[10px] gap-[8px]">
              {picker.options.map((mode) => {
                const selected = mode === picker.selected;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => picker.onSelect(mode)}
                    accessibilityRole="button"
                    accessibilityLabel={`${MODE_LABEL[mode]} — ${MODE_HINT[mode]}`}
                    accessibilityState={{ selected }}
                    className="px-[14px] py-[12px] active:opacity-70"
                  >
                    <Face name={selected ? 'accent' : 'card'} radius={11} />
                    <Text
                      className={`text-[14px] font-medium tracking-[-0.2px] ${
                        selected ? 'text-ink' : 'text-ink-muted'
                      }`}
                    >
                      {MODE_LABEL[mode]}
                    </Text>
                    <Text className="mt-[3px] text-[12px] leading-[17px] text-ink-faint">
                      {MODE_HINT[mode]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        className="border-t border-t-line-soft px-[18px] pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          accessibilityLabel={startLabel}
          onPress={onStart}
        >
          {startLabel}
        </Button>
      </View>
    </View>
  );
}
