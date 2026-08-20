import { Text, View } from 'react-native';

import { SquircleView } from '@/components/Squircle';
import type { CalloutBlock as CalloutBlockData, CalloutTone } from '@/lib/content';
import { useToken } from '@/lib/tokens';

import { RichText } from '../RichText';

const TONE: Record<CalloutTone, { label: string; edge: string; text: string }> = {
  info: { label: 'Note', edge: 'bg-accent', text: 'text-accent' },
  tip: { label: 'Tip', edge: 'bg-amber', text: 'text-amber' },
  warning: { label: 'Careful', edge: 'bg-rose', text: 'text-rose' },
};

export function CalloutBlock({ block }: { block: CalloutBlockData }) {
  const tone = TONE[block.tone];
  const surface = useToken('--surface', '#181a1f');
  const lineSoft = useToken('--line-soft', '#23262d');

  return (
    // Clipping, so the tone bar tapers into the corner the way the left border it
    // replaces used to — a straight bar would poke out past the curve.
    <SquircleView
      radius={13}
      fill={surface}
      stroke={lineSoft}
      strokeWidth={1}
      clip
      className="mt-[18px] py-[14px] pl-[16px] pr-[14px]"
    >
      <View className={`absolute inset-y-0 left-0 w-[2px] ${tone.edge}`} />
      <Text
        className={`font-mono text-[9.5px] font-semibold uppercase tracking-[2px] ${tone.text}`}
      >
        {tone.label}
      </Text>
      <RichText
        spans={block.spans}
        className="mt-[7px] text-[14px] leading-[21px] text-ink-muted"
      />
    </SquircleView>
  );
}
