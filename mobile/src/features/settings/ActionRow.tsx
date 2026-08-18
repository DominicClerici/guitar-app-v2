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
  /** Omit for a row that has nothing behind it yet — see below. */
  onPress?: () => void;
}

/**
 * A settings row that opens something rather than setting something.
 *
 * It shares `PreferenceRow`'s height so the column keeps one rhythm, but carries only a word where
 * that row carries a pill tray. Neither has a gutter of its own any more: out of the card, the page
 * sets the margin and every label starts on the same line as its section heading.
 *
 * The chevron is what says the row leads somewhere — without it a label alone reads as a heading
 * for the row under it.
 *
 * A `value` is for the other kind of row this shape covers: one that opens a setting too wide for a
 * pill tray. It reads what is set without the sheet having to be opened to find out, which is what
 * keeps such a row in the same list as the ones that show their whole setting on the line.
 *
 * With no `onPress` the row is not a control at all: faint ink, no chevron, nothing to press. A row
 * that looks live and answers to nothing reads as broken, so one that is still being built says so
 * by not offering itself — and the call site says how long with a `value`.
 */
export function ActionRow({ label, value, tone = 'neutral', onPress }: Props) {
  const [faint, rose] = useTokens(TOKENS).map((token, index) => token ?? FALLBACKS[index]);
  const destructive = tone === 'destructive';
  const wired = Boolean(onPress);

  return (
    <Pressable
      onPress={onPress}
      disabled={!wired}
      accessibilityRole={wired ? 'button' : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      className={`h-[54px] flex-row items-center gap-[12px] ${wired ? 'active:opacity-60' : ''}`}
    >
      <Text
        numberOfLines={1}
        className={`flex-1 text-[14.5px] font-medium tracking-[-0.2px] ${
          destructive ? 'text-rose' : wired ? 'text-ink' : 'text-ink-faint'
        }`}
      >
        {label}
      </Text>

      {value ? (
        <Text numberOfLines={1} className="font-mono text-[13px] text-ink-muted">
          {value}
        </Text>
      ) : null}

      {wired ? (
        <SymbolView
          name="chevron.right"
          size={11}
          weight="semibold"
          tintColor={destructive ? rose : faint}
        />
      ) : null}
    </Pressable>
  );
}
