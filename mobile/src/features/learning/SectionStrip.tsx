import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToken } from '@/lib/tokens';

// The footer under an article opened from a pathway: where this sits, and whether it counts yet.
//
// It sits below the article rather than over it so the last paragraph is never hidden behind it —
// which matters more here than anywhere else, because reaching that last paragraph is exactly what
// marks the section done.

export function SectionStrip({
  chapterTitle,
  position,
  total,
  complete,
}: {
  chapterTitle: string;
  /** 1-based; 0 for an optional section, which has a chapter but no number in it. */
  position: number;
  total: number;
  complete: boolean;
}) {
  const insets = useSafeAreaInsets();
  const accent = useToken('--accent', '#5ec8c2');

  return (
    <View
      className="flex-row items-center gap-[12px] border-t border-t-line-soft bg-tray px-[18px] pt-[13px]"
      style={{ paddingBottom: insets.bottom + 13 }}
    >
      <Text
        numberOfLines={1}
        className="flex-1 font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint"
      >
        {position > 0 ? `Section ${position} of ${total}` : chapterTitle}
      </Text>

      {complete ? (
        <View className="flex-row items-center gap-[6px]">
          <SymbolView name="checkmark" size={10} weight="bold" tintColor={accent} />
          <Text className="font-mono text-[9.5px] font-semibold uppercase tracking-[2px] text-accent">
            Done
          </Text>
        </View>
      ) : (
        <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
          Read to the end
        </Text>
      )}
    </View>
  );
}
