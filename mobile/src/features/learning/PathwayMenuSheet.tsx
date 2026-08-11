import { SymbolView } from 'expo-symbols';
import { useState, type ComponentProps, type Ref } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useFace } from '@/components/CornerFace';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { MAX_ACTIVE_PATHWAYS } from '@/lib/learning';
import { useToken } from '@/lib/tokens';

// Everything a pathway can do that is not "keep going". None of it earns a place on the screen
// itself — the two destructive-or-informational actions here are wanted about once per pathway —
// so they live behind the one control next to Continue.

type Symbol = ComponentProps<typeof SymbolView>['name'];

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
  // Dropping is one tap away from undoing weeks of ordering, so it asks once.
  const [confirmingDrop, setConfirmingDrop] = useState(false);

  const reset = () => {
    setPanel('menu');
    setConfirmingDrop(false);
  };

  return (
    <Sheet ref={ref} onDismiss={reset}>
      <View className="px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        {panel === 'about' ? (
          <AboutPathways onBack={() => setPanel('menu')} />
        ) : (
          <View className="gap-[9px]">
            <MenuButton
              symbol="bubble.left.and.text.bubble.right"
              label="Give Feedback"
              // Inert by request — there is no destination for it yet, and a button that opens a
              // half-built one is worse than a button that waits.
              onPress={() => {}}
            />
            <MenuButton
              symbol="info.circle"
              label="About Pathways"
              onPress={() => setPanel('about')}
            />
            {enrolled ? (
              <MenuButton
                symbol={confirmingDrop ? 'exclamationmark.triangle.fill' : 'trash'}
                label={confirmingDrop ? 'Tap again to drop' : 'Drop Pathway'}
                danger
                armed={confirmingDrop}
                onPress={() => {
                  if (!confirmingDrop) {
                    setConfirmingDrop(true);
                    return;
                  }
                  onDrop();
                }}
              />
            ) : null}
          </View>
        )}
      </View>
    </Sheet>
  );
}

function MenuButton({
  symbol,
  label,
  danger = false,
  armed = false,
  onPress,
}: {
  symbol: Symbol;
  label: string;
  danger?: boolean;
  /** A destructive button that has been tapped once and is waiting for the second. */
  armed?: boolean;
  onPress: () => void;
}) {
  const ink = useToken('--ink', '#eef0f4');
  const rose = useToken('--rose', '#e0788f');
  const bg = useToken('--bg', '#0c0d10');
  const face = useFace(armed ? 'bare' : 'key', 12);

  const tint = armed ? bg : danger ? rose : ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-[52px] flex-row items-center gap-[12px] rounded-[12px] px-[16px] active:opacity-70 ${
        armed ? 'bg-rose' : face.className
      }`}
    >
      {armed ? null : face.paint}
      <SymbolView name={symbol} size={16} weight="semibold" tintColor={tint} />
      <Text
        className={`text-[15px] font-medium tracking-[-0.2px] ${
          armed ? 'text-bg' : danger ? 'text-rose' : 'text-ink'
        }`}
      >
        {label}
      </Text>
    </Pressable>
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
