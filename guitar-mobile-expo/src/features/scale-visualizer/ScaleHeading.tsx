import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { Scale } from '@/lib/scale-library';

/**
 * What you are looking at, and why you would want to. Only the root goes through
 * the glyph rewriter — a scale *name* contains ordinary prose, and "Major blues"
 * would come back as "Major ♭lues".
 */
export function ScaleHeading({ scale }: { scale: Scale }) {
  return (
    <View className="px-[18px]">
      <Text className="text-[26px] font-semibold tracking-[-0.6px] text-ink">
        {toAccidentalGlyphs(scale.root)} {scale.type.name}
      </Text>
      <Text className="mt-[4px] text-[12.5px] leading-[17px] text-ink-muted">
        {scale.type.character}
      </Text>
    </View>
  );
}
