import { Text, View } from 'react-native';

import type { CalloutBlock as CalloutBlockData, CalloutTone } from '@/lib/articles';

import { RichText } from '../RichText';

const TONE: Record<CalloutTone, { label: string; edge: string; text: string }> = {
  info: { label: 'Note', edge: 'border-l-accent', text: 'text-accent' },
  tip: { label: 'Tip', edge: 'border-l-amber', text: 'text-amber' },
  warning: { label: 'Careful', edge: 'border-l-rose', text: 'text-rose' },
};

export function CalloutBlock({ block }: { block: CalloutBlockData }) {
  const tone = TONE[block.tone];

  return (
    <View
      className={`mt-[18px] rounded-[13px] border border-line-soft border-l-[2px] bg-surface p-[14px] ${tone.edge}`}
    >
      <Text
        className={`font-mono text-[9.5px] font-semibold uppercase tracking-[2px] ${tone.text}`}
      >
        {tone.label}
      </Text>
      <RichText
        spans={block.spans}
        className="mt-[7px] text-[14px] leading-[21px] text-ink-muted"
      />
    </View>
  );
}
