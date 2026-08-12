import { useRef, useState, type Ref } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArmedButton, type ArmedButtonRef } from '@/components/ArmedButton';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { MAX_ACTIVE_PATHWAYS } from '@/lib/learning';

// Everything a pathway can do that is not "keep going". None of it earns a place on the screen
// itself — the two destructive-or-informational actions here are wanted about once per pathway —
// so they live behind the one control next to Continue.

export type PathwayMenuSheetRef = SheetRef;

interface Props {
  ref?: Ref<PathwayMenuSheetRef>;
  /** Hides Drop Pathway for a pathway the learner is only browsing. */
  enrolled: boolean;
  onDrop: () => void;
}

export function PathwayMenuSheet({ ref, enrolled, onDrop }: Props) {
  const insets = useSafeAreaInsets();
  // About is a panel of this sheet rather than a sheet of its own: a modal over a modal is a worse
  // way back out than a title with a chevron on it.
  const [panel, setPanel] = useState<'menu' | 'about'>('menu');
  // Dropping is one tap away from undoing weeks of ordering, so it asks once. The sheet holds
  // the button rather than the answer: closing it takes the question back.
  const drop = useRef<ArmedButtonRef>(null);

  const reset = () => {
    setPanel('menu');
    drop.current?.disarm();
  };

  return (
    <Sheet ref={ref} onDismiss={reset}>
      <View className="px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        {panel === 'about' ? (
          <AboutPathways onBack={() => setPanel('menu')} />
        ) : (
          <View className="gap-[9px]">
            <Button
              variant="secondary"
              size="lg"
              align="start"
              icon="bubble.left.and.text.bubble.right"
              // Inert by request — there is no destination for it yet, and a button that opens a
              // half-built one is worse than a button that waits.
              onPress={() => {}}
            >
              Give Feedback
            </Button>
            <Button
              variant="secondary"
              size="lg"
              align="start"
              icon="info.circle"
              onPress={() => setPanel('about')}
            >
              About Pathways
            </Button>
            {enrolled ? (
              <ArmedButton
                ref={drop}
                size="lg"
                align="start"
                icon="trash"
                armedIcon="exclamationmark.triangle.fill"
                label="Drop Pathway"
                armedLabel="Tap again to drop"
                onConfirm={onDrop}
              />
            ) : null}
          </View>
        )}
      </View>
    </Sheet>
  );
}

function AboutPathways({ onBack }: { onBack: () => void }) {
  return (
    <View>
      <Button
        variant="ghost"
        size="inline"
        icon="chevron.left"
        hitSlop={10}
        className="-ml-[4px]"
        onPress={onBack}
      >
        About Pathways
      </Button>

      <View className="mt-[14px] gap-[16px]">
        <Note
          title="Chapters are the only gate"
          body="Inside a chapter you are open — take the lessons in any order, or skip back to one you have already read. The next chapter waits until this one is finished and its quiz is passed."
        />
        <Note
          title="Optional lessons never block you"
          body="Drills marked Optional are worth doing and are not counted. A chapter finishes without them."
        />
        <Note
          title="Your best score is what counts"
          body="A chapter quiz keeps your highest score, so a retake can only help. Passing once keeps the chapter open for good."
        />
        <Note
          title={`Up to ${MAX_ACTIVE_PATHWAYS} at a time`}
          body="Dropping a pathway only takes it off your list. Everything you have finished is kept, and starting it again picks up exactly where you left off."
        />
      </View>
    </View>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <View>
      <Text className="text-[13.5px] font-semibold tracking-[-0.2px] text-ink">{title}</Text>
      <Text className="mt-[4px] text-[12.5px] leading-[18px] text-ink-muted">{body}</Text>
    </View>
  );
}
