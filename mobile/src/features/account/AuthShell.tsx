import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Face } from '@/components/Face';

interface Props {
  title: string;
  blurb: string;
  children: ReactNode;
}

/**
 * The frame every account view sits in.
 *
 * `keyboardShouldPersistTaps` is not optional here: the tab is a page inside the PagerView, and
 * without it the first tap on a submit button is swallowed dismissing the keyboard.
 */
export function AuthShell({ title, blurb, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerClassName="grow pt-[24px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <Text className="text-[24px] font-semibold tracking-[-0.6px] text-ink">{title}</Text>
        <Text className="mt-[6px] text-[14px] leading-[20px] text-ink-muted">{blurb}</Text>

        <View className="mt-[24px] gap-[16px]">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** A failure that belongs to the whole form rather than one field. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View className="px-[12px] py-[10px]">
      <Face name="alert" radius={10} />
      <Text className="text-[13px] leading-[18px] text-rose">{message}</Text>
    </View>
  );
}

/** The text button under a form that swaps to another one. */
export function AuthSwitch({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <Text className="text-center text-[13px] text-ink-faint">
      {prompt}{' '}
      <Text className="font-medium text-accent active:opacity-60" onPress={onPress}>
        {action}
      </Text>
    </Text>
  );
}
