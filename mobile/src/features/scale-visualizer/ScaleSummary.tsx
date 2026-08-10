import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import { stepFormula, type Scale } from '@/lib/scale-library';

import { HUE_TEXT } from './hues';

/**
 * The scale written out: its notes, the degree each one is, and the steps between
 * them. The character tone's degree is tinted the same hue the neck gives it, so
 * the note you can see is the odd one out on the board is also the one named here.
 */
export function ScaleSummary({ scale }: { scale: Scale }) {
  const accent = scale.type.accent;
  const steps = stepFormula(scale.type.semitones);

  return (
    <View className="mx-[18px] rounded-[11px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface px-[10px] py-[14px]">
      <View className="flex-row">
        {scale.notes.map((note, slot) => {
          const degree = scale.type.degrees[slot];
          const tinted = accent && accent.degree === degree;

          return (
            <View key={`${degree}-${slot}`} className="flex-1 items-center">
              <Text className="text-[15px] font-semibold tracking-[-0.2px] text-ink">
                {toAccidentalGlyphs(note)}
              </Text>
              <Text
                className={`mt-[4px] font-mono text-[9.5px] tracking-[0.8px] ${
                  tinted ? HUE_TEXT[accent.hue] : 'text-ink-faint'
                }`}
              >
                {toAccidentalGlyphs(degree)}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="mt-[13px] h-px bg-line-soft" />

      <View className="mt-[11px] flex-row items-baseline gap-[10px] px-[4px]">
        <Text className="font-mono text-[9px] font-semibold uppercase tracking-[1.6px] text-ink-faint">
          Steps
        </Text>
        <Text className="flex-1 font-mono text-[10.5px] tracking-[1.4px] text-ink-muted">
          {steps.join('  ')}
        </Text>
      </View>
    </View>
  );
}
