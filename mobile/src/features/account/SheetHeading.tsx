import { Text, View } from 'react-native';

/**
 * The first thing in an account sheet: what it is, and what it will do.
 *
 * Every one of these sheets is a question rather than a panel of controls, and a question asked
 * without saying what answering it costs is not really asked — so the blurb is where the
 * consequence goes, not the button.
 */
export function SheetHeading({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <View>
      <Text className="text-[18px] font-semibold tracking-[-0.4px] text-ink">{title}</Text>
      {blurb ? (
        <Text className="mt-[6px] text-[13px] leading-[19px] text-ink-muted">{blurb}</Text>
      ) : null}
    </View>
  );
}
