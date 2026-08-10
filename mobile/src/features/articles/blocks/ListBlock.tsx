import { Text, View } from 'react-native';

import type { ListBlock as ListBlockData } from '@/lib/content';

import { RichText } from '../RichText';

export function ListBlock({ block }: { block: ListBlockData }) {
  return (
    <View className="mt-[14px] gap-[9px]">
      {block.items.map((item, index) => (
        <View key={index} className="flex-row gap-[10px]">
          {block.ordered ? (
            <Text className="w-[18px] pt-[3px] text-right font-mono text-[11px] text-ink-faint">
              {index + 1}.
            </Text>
          ) : (
            <Text className="w-[18px] pt-[1px] text-right text-[13px] text-accent">•</Text>
          )}
          <RichText spans={item} className="flex-1 text-[15px] leading-[23px] text-ink-muted" />
        </View>
      ))}
    </View>
  );
}
