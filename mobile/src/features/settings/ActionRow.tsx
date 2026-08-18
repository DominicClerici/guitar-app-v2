import { SymbolView } from 'expo-symbols';
import { Pressable, Text } from 'react-native';

import { useTokens } from '@/lib/tokens';

const TOKENS = ['--ink-faint', '--rose'] as const;

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
const FALLBACKS = ['#62666e', '#e0788f'];

interface Props {
  label: string;
  /** What the row is currently set to, where it opens a setting rather than an action. */
  value?: string;
  /** Rose ink, for a row whose sheet asks before it does anything. */
  tone?: 'neutral' | 'destructive';
  onPress: () => void;
}

/**
 * A settings row that opens something rather than setting something.
 *
 * It shares `PreferenceRow`'s gutter so the labels line up down the card, but not its height: a row
 * carrying only a word does not need the box a pill tray needs, and matching it would leave the
 * account actions looking like controls that had lost their controls.
 *
 * The chevron is what says the row leads somewhere — without it a label alone reads as a heading
 * for the row under it.
 *
 * A `value` is for the other kind of row this shape covers: one that opens a setting too wide for a
 * pill tray. It reads what is set without the sheet having to be opened to find out, which is what
 * keeps such a row in the same list as the ones that show their whole setting on the line.
 */
export function ActionRow({ label, value, tone = 'neutral', onPress }: Props) {
  const [faint, rose] = useTokens(TOKENS).map((token, index) => token ?? FALLBACKS[index]);
  const destructive = tone === 'destructive';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      className="h-[52px] flex-row items-center gap-[12px] px-[14px] active:opacity-60"
    >
      <Text
        numberOfLines={1}
        className={`flex-1 text-[14.5px] font-medium tracking-[-0.2px] ${
          destructive ? 'text-rose' : 'text-ink'
        }`}
      >
        {label}
      </Text>

      {value ? (
        <Text numberOfLines={1} className="font-mono text-[13px] text-ink-muted">
          {value}
        </Text>
      ) : null}

      <SymbolView
        name="chevron.right"
        size={11}
        weight="semibold"
        tintColor={destructive ? rose : faint}
      />
    </Pressable>
  );
}
