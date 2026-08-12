import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Swap } from '@/components/Swap';
import { useToken } from '@/lib/tokens';

// The footer under an article opened from a pathway: the way back a step, and the one thing this
// screen is for — saying the section is read, then moving on.
//
// It sits below the article rather than over it so the last paragraph is never hidden behind it,
// which matters more here than anywhere else: reaching that last paragraph is one of the two ways
// the section marks itself done.
//
// Nothing in here moves. Both controls change identity — Previous appears and disappears with the
// section, Mark Complete becomes Next — and each does it by fading out and back in where it stands,
// so the bar itself reads as one fixed thing the reader is paging content past.

/** What the right-hand control currently is. Changing it is what runs the swap. */
type Face = 'mark' | 'next' | 'done';

/** The pause the completion swap holds at zero opacity, long enough to read as a replacement. */
const COMPLETE_HOLD_MS = 50;

export function SectionBar({
  complete,
  onMarkComplete,
  onPrevious,
  onNext,
  fadeMs = 150,
  paging = false,
}: {
  complete: boolean;
  onMarkComplete: () => void;
  /** Omitted at the start of a chapter, where the control is not shown rather than disabled. */
  onPrevious?: () => void;
  /** Omitted when the chapter ends here — see `sectionNeighbours`. */
  onNext?: () => void;
  /** Half of the transition the controls are keeping time with. */
  fadeMs?: number;
  /**
   * Whether the change on its way is a page rather than a completion.
   *
   * A completion holds a beat between the two halves because one control is being *replaced* by
   * another and the gap is what says so. A page has no gap: the controls are keeping time with
   * content sliding past, and a pause in the middle of that reads as a stutter.
   */
  paging?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const accent = useToken('--accent', '#5ec8c2');

  const face: Face = !complete ? 'mark' : onNext ? 'next' : 'done';

  return (
    <View
      className="flex-row items-center justify-between border-t border-t-line-soft bg-tray px-[18px] pt-[10px]"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      <Swap
        id={onPrevious ? 'previous' : 'none'}
        fadeMs={fadeMs}
        holdMs={0}
        render={(id) =>
          id === 'previous' && onPrevious ? (
            <Button variant="ghost" size="inline" icon="chevron.left" onPress={onPrevious}>
              Previous
            </Button>
          ) : null
        }
      />

      <Swap
        id={face}
        fadeMs={fadeMs}
        holdMs={paging ? 0 : COMPLETE_HOLD_MS}
        render={(id) =>
          id === 'mark' ? (
            <Button variant="ghost" size="inline" onPress={onMarkComplete}>
              Mark Complete
            </Button>
          ) : id === 'next' && onNext ? (
            <Button variant="link" size="inline" accessibilityLabel="Next section" onPress={onNext}>
              <Text className="text-[15px] font-medium tracking-[-0.2px] text-accent">Next</Text>
              <SymbolView name="chevron.right" size={15} weight="semibold" tintColor={accent} />
            </Button>
          ) : (
            <View className="flex-row items-center gap-[6px] py-[6px]">
              <SymbolView name="checkmark" size={10} weight="bold" tintColor={accent} />
              <Text className="font-mono text-[9.5px] font-semibold uppercase tracking-[2px] text-accent">
                Done
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
