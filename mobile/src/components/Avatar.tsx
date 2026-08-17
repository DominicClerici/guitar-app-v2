import { SymbolView } from 'expo-symbols';
import { Text } from 'react-native';

import { useTokens } from '@/lib/tokens';

import { SquirclePressable } from './Squircle';

/** Kept beside the `h-[34px] w-[34px]` below, which Tailwind has to read as a literal. */
const SIZE = 34;

const TOKENS = [
  '--accent-wash',
  '--accent-line',
  '--surface-raised',
  '--line-soft',
  '--ink-muted',
] as const;

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
const FALLBACKS = [
  'rgba(94, 200, 194, 0.12)',
  'rgba(94, 200, 194, 0.5)',
  '#20232a',
  '#23262d',
  '#9aa0aa',
];

/**
 * The account face a screen header wears: initials in accent for a real account, a neutral glyph
 * for anyone the app has yet to meet.
 *
 * `SquirclePressable` rather than `Face` — this sits in a header that paints with the screen, and a
 * face that measures itself first would blink in a frame late every time the tab is shown.
 *
 * Presentational: it neither reads the session nor knows what pressing it does.
 */
export function Avatar({
  initials,
  onPress,
  accessibilityLabel,
}: {
  /** Null for a guest, or a session still loading — both show the glyph. */
  initials?: string | null;
  /** Omit for an avatar that is an indicator rather than a control. */
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  const [wash, line, raised, soft, muted] = useTokens(TOKENS).map(
    (value, index) => value ?? FALLBACKS[index],
  );
  const named = Boolean(initials);

  return (
    <SquirclePressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={10}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel}
      radius={SIZE / 2}
      fill={named ? wash : raised}
      stroke={named ? line : soft}
      strokeWidth={1}
      className={`h-[34px] w-[34px] items-center justify-center ${
        onPress ? 'active:opacity-70' : ''
      }`}
    >
      {named ? (
        <Text className="text-[13px] font-semibold tracking-[-0.2px] text-accent">{initials}</Text>
      ) : (
        <SymbolView name="person.fill" size={15} tintColor={muted} />
      )}
    </SquirclePressable>
  );
}
