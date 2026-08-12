import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { BackLink } from './BackLink';

/**
 * The header a section of a pathway wears: the way back, where you are, and whatever the screen
 * wants in the corner.
 *
 * One component rather than the same row written three times because it has to survive being
 * navigated *through*. Paging from an article into a quiz replaces the screen under a header that
 * is supposed to have held still, so the two rows have to agree on their spacing to the pixel — a
 * title four points further along is the whole illusion gone.
 */
export function ReaderHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <View className="h-[42px] flex-row items-center gap-[6px] px-[18px]">
      <BackLink />
      <Text numberOfLines={1} className="flex-1 text-[15px] font-medium tracking-[-0.2px] text-ink">
        {title}
      </Text>
      {trailing}
    </View>
  );
}
