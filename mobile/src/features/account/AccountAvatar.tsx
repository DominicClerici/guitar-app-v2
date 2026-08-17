import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import { initials, type Nameable } from './initials';

export interface AvatarUser extends Nameable {
  /** A provider's picture, when there is one; everyone else gets their initials. */
  image?: string | null;
}

/**
 * `withUniwind` is what makes the picture appear at all: `expo-image`'s `Image` is a third-party
 * component, so it takes `style` and ignores `className` until it has been wrapped — and a class
 * list carrying the width and height, silently dropped, leaves a zero-sized image.
 */
const AvatarImage = withUniwind(Image);

/**
 * The two sizes an account's face comes in, as literals — Tailwind has to read a class as a
 * literal, so a `size` in pixels could not become one.
 */
const SIZES = {
  /** Beside the name and address, at the top of Settings. */
  sm: { box: 'h-[44px] w-[44px]', label: 'text-[16px]' },
  /** The subject of the profile sheet rather than a repeat of the row that opened it. */
  lg: { box: 'h-[72px] w-[72px]', label: 'text-[26px]' },
} as const;

export type AvatarSize = keyof typeof SIZES;

/** The account's face: a provider's picture where there is one, initials where there is not. */
export function AccountAvatar({
  user,
  size = 'sm',
  className = '',
}: {
  user: AvatarUser;
  size?: AvatarSize;
  /** Layout only — margins, alignment. */
  className?: string;
}) {
  const metrics = SIZES[size];

  if (user.image) {
    return (
      <AvatarImage
        source={{ uri: user.image }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
        className={`rounded-full border border-line-soft bg-surface ${metrics.box} ${className}`}
      />
    );
  }

  return (
    <View
      className={`items-center justify-center rounded-full border border-accent-line bg-accent-wash ${metrics.box} ${className}`}
    >
      <Text className={`font-semibold tracking-[-0.2px] text-accent ${metrics.label}`}>
        {initials(user)}
      </Text>
    </View>
  );
}
