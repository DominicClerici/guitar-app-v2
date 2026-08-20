import { Image } from 'expo-image';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

import { SquircleView } from '@/components/Squircle';
import type { ImageBlock as ImageBlockData } from '@/lib/content';
import { useToken } from '@/lib/tokens';

import { RichText } from '../RichText';

const StyledImage = withUniwind(Image);

export function ImageBlock({ block }: { block: ImageBlockData }) {
  const surface = useToken('--surface', '#181a1f');

  return (
    <View className="mt-[18px]">
      <SquircleView
        radius={13}
        fill={surface}
        clip
        className="w-full"
        style={{ aspectRatio: block.aspectRatio }}
      >
        <StyledImage
          source={{ uri: block.url }}
          accessibilityLabel={block.alt}
          contentFit="cover"
          className="h-full w-full"
        />
      </SquircleView>
      {block.caption ? (
        <RichText
          spans={block.caption}
          className="mt-[8px] text-center font-mono text-[10px] tracking-[1px] text-ink-faint"
        />
      ) : null}
    </View>
  );
}
