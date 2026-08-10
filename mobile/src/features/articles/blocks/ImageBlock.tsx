import { Image } from 'expo-image';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

import type { ImageBlock as ImageBlockData } from '@/lib/content';

import { RichText } from '../RichText';

const StyledImage = withUniwind(Image);

export function ImageBlock({ block }: { block: ImageBlockData }) {
  return (
    <View className="mt-[18px]">
      <StyledImage
        source={{ uri: block.url }}
        accessibilityLabel={block.alt}
        contentFit="cover"
        className="w-full rounded-[13px] bg-surface"
        style={{ aspectRatio: block.aspectRatio }}
      />
      {block.caption ? (
        <RichText
          spans={block.caption}
          className="mt-[8px] text-center font-mono text-[10px] tracking-[1px] text-ink-faint"
        />
      ) : null}
    </View>
  );
}
