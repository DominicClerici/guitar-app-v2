import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

/**
 * One group of settings, under the name of the thing they all change.
 *
 * The rows themselves are bare — no card, no face, no rule between them. What separates a setting
 * from the one above it is only whether they belong to the same group, so the heading and the line
 * running off it are the whole of the structure: everything under one rule is one subject, and the
 * next rule is the next subject starting.
 *
 * That is also why the rules do not go between rows. A hairline under every row would draw the card
 * back in outline and lose the only distinction the page is making.
 */
export function SettingsSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="mt-[28px]">
      <View className="flex-row items-center gap-[12px]">
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
          {label}
        </Text>
        <View className="h-px flex-1 bg-line-soft" />
      </View>

      <View className="mt-[4px]">{children}</View>
    </View>
  );
}
