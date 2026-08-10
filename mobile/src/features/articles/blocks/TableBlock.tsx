import { View } from 'react-native';

import type { Span, TableBlock as TableBlockData } from '@/lib/content';

import { RichText } from '../RichText';

// Columns share the width equally — good enough for the comparison tables
// articles actually use. A table needing measured columns is a new block type.

function Row({ cells, className }: { cells: Span[][]; className: string }) {
  return (
    <View className="flex-row">
      {cells.map((cell, index) => (
        <View key={index} className="flex-1 px-[12px] py-[9px]">
          <RichText spans={cell} className={className} />
        </View>
      ))}
    </View>
  );
}

export function TableBlock({ block }: { block: TableBlockData }) {
  return (
    <View className="mt-[18px] overflow-hidden rounded-[13px] border border-line-soft">
      {block.header ? (
        <View className="bg-surface">
          <Row
            cells={block.header}
            className="font-mono text-[9.5px] font-semibold uppercase tracking-[1.5px] text-ink-faint"
          />
        </View>
      ) : null}
      {block.rows.map((row, index) => (
        <View key={index} className={index || block.header ? 'border-t border-t-line-soft' : ''}>
          <Row cells={row} className="text-[13px] leading-[19px] text-ink-muted" />
        </View>
      ))}
    </View>
  );
}
