import { Text, View } from 'react-native';

import type { QuoteBlock as QuoteBlockData } from '@/lib/articles';

import { RichText } from '../RichText';

export function QuoteBlock({ block }: { block: QuoteBlockData }) {
  return (
    <View className="mt-[18px] border-l-[2px] border-l-line pl-[14px]">
      <RichText
        spans={block.spans}
        className="font-serif text-[16px] italic leading-[25px] text-ink"
      />
      {block.attribution ? (
        <Text className="mt-[8px] font-mono text-[10px] uppercase tracking-[1.5px] text-ink-faint">
          — {block.attribution}
        </Text>
      ) : null}
    </View>
  );
}
