import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Platform, Text, View } from 'react-native';
import { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { withUniwind } from 'uniwind';

import { toast, useCurrentToast, type ToastTone } from '@/lib/toast';
import { useTokens } from '@/lib/tokens';

import { AnimatedView } from './AnimatedView';
import { SquirclePressable } from './Squircle';

const SafeArea = withUniwind(SafeAreaView);

const FACE = ['--surface-raised', '--line'] as const;

/**
 * What kind of report this is, said with a single dot rather than an icon. The
 * message is the content; the dot only has to be enough to tell a confirmation
 * apart from a failure at a glance, and a stock warning triangle over every error
 * would shout louder than the sentence next to it.
 */
const TONE: Record<ToastTone, string> = {
  success: 'bg-accent',
  error: 'bg-rose',
  info: 'bg-ink-muted',
};

/**
 * Where toasts appear. Mounted once, by the root layout.
 *
 * The hard part of a toast is not the animation, it is being on top of whatever is
 * already there — and on both platforms the thing in the way is the same one, the
 * `onboarding` modal, which is exactly where a sync failure or an auth error has to
 * be readable. The two platforms need different answers:
 *
 * - iOS presents a modal route as its own view controller, so nothing rendered in
 *   the React tree can sit above it. `FullWindowOverlay` puts its content straight
 *   into the app's window instead. It reports a hit only where there is actually
 *   something to touch, so it can stay mounted the whole time without swallowing a
 *   single tap — which an `RCTModal` in its place would do for as long as a toast
 *   was up.
 * - Android presents every stack route, modal included, as an ordinary fragment in
 *   the one hierarchy (`ScreenStack.adapt`), so a plain view rendered after the
 *   navigator is already above it and no overlay is needed.
 *
 * The container stays mounted and empty between toasts. It has to: an exit
 * animation needs a parent that outlives the child running it.
 */
export function ToastHost() {
  const current = useCurrentToast();
  const [fill = '#20232a', stroke = '#2a2e36'] = useTokens(FACE);

  const id = current?.id;
  const tone = current?.tone;
  const durationMs = current?.durationMs;

  useEffect(() => {
    if (id === undefined || durationMs === undefined) return;
    const timer = setTimeout(() => toast.dismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs]);

  // Keyed on the id as well as the tone, so a second failure is felt as its own
  // event rather than passing silently because the last toast was also an error.
  useEffect(() => {
    if (id === undefined || tone !== 'error') return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [id, tone]);

  return (
    <Overlay>
      <SafeArea
        edges={['top']}
        pointerEvents="box-none"
        className="absolute inset-x-0 top-0 items-center px-4"
      >
        {current ? (
          <AnimatedView
            key={current.id}
            entering={FadeInUp.springify().damping(18).stiffness(220)}
            exiting={FadeOutUp.duration(180)}
            className="w-full max-w-[420px]"
          >
            <SquirclePressable
              radius={14}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
              onPress={() => toast.dismiss(current.id)}
              accessibilityLabel={`${current.message}. Tap to dismiss.`}
              className="w-full flex-row items-center gap-[10px] px-[14px] py-[12px] active:opacity-80"
            >
              <View className={`size-[7px] rounded-full ${TONE[current.tone]}`} />
              <Text
                numberOfLines={2}
                className="flex-1 text-[13px] font-semibold tracking-[-0.2px] text-ink"
              >
                {current.message}
              </Text>
            </SquirclePressable>
          </AnimatedView>
        ) : null}
      </SafeArea>
    </Overlay>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'ios') return children;
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}
