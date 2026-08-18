import '@/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { ToastHost } from '@/components/ToastHost';
import { CoverHost, CurtainHost, isCovered } from '@/features/curtain';
import { ApiProvider } from '@/lib/api';
import { useEnsureGuestSession } from '@/lib/auth';
import { ContentProvider } from '@/lib/content-cache';
import { PreferencesProvider, readPreferences, useReduceMotion } from '@/lib/preferences';
import { SyncProvider } from '@/lib/sync';

const GestureRoot = withUniwind(GestureHandlerRootView);

/**
 * How a push travels, when it travels at all.
 *
 * A fade rather than nothing: reduce motion asks for less movement, not for a screen to be
 * replaced between one frame and the next with no sign that anything happened. Opacity is the
 * conventional stand-in, and it leaves the change of screen legible.
 *
 * Read from the published snapshot rather than through a hook, for the reason the whole file reads
 * things this way: these are evaluated as the navigator builds a screen, which is the push itself,
 * and subscribing here would re-render the entire app to answer a question only asked at that one
 * moment. What Reanimated needs is subscribed to separately, by `MotionConfig` below.
 */
function pushAnimation(): 'fade' | 'default' {
  return readPreferences().reduceMotion === 'on' ? 'fade' : 'default';
}

/**
 * A screen the reader pages into rather than pushes.
 *
 * The article has already slid its own content and footer away under a header that stayed put, so
 * the stack must not slide anything: the destination appears in place and fades its body in (see
 * `ReaderHop`). Read off the route rather than set globally, because the same quiz opened from the
 * pathway screen is an ordinary push and should still arrive like one.
 */
const pagedInto = ({ route }: { route: { params?: object } }) =>
  ({
    animation:
      (route.params as { enter?: string } | undefined)?.enter === 'fade'
        ? 'none'
        : pushAnimation(),
  }) as const;

/**
 * Onboarding, which is pushed either onto a screen someone is looking at or onto a cover.
 *
 * Covered, it must not travel: a push slides the screen behind it away, and hiding exactly that is
 * what the cover was raised for — a provider signed someone in on the account screen and the flow
 * is being put underneath before the cover lifts (see `features/onboarding/handoff.ts`). So it
 * appears, the flow takes the cover away, and the arrival is the flow's own fade rather than the
 * navigator's slide.
 *
 * Asked of the cover here rather than carried in a param, because a param would have to reach this
 * route and query params only ever land on the deepest one — `onboarding` is a group with a stack
 * of its own inside it. Read rather than subscribed to for a better reason: this is evaluated as
 * the navigator builds the screen, which is the push itself, and subscribing would re-render the
 * whole app twice for every sign-in to answer a question only ever asked at that one moment.
 */
const overCover = () => ({ animation: isCovered() ? 'none' : pushAnimation() }) as const;

/**
 * Reduce motion, told to Reanimated once for the whole app.
 *
 * This is the entire implementation of the setting for everything Reanimated drives — every
 * `withTiming`, `withSpring`, `withRepeat`, and every `entering`/`exiting`/`layout` prop, including
 * the ones built in module-scope worklets that no hook could reach. Reanimated checks the flag
 * where it constructs an animation, on the UI thread, so a reduced animation lands on its final
 * value without a single component knowing it happened.
 *
 * What it does not touch is anything that is not an animation: a shared value written directly from
 * a gesture, a scroll handler, an `interpolate`. So dragging, scrolling and every live reading —
 * the tuner's needle colour, the seismograph's trace — carry on exactly as before, which is the
 * point. Reduce motion is a request to stop decorating, not to stop responding.
 *
 * `Always`/`Never` rather than `System`: the stored choice has already taken the device's setting
 * into account, and once someone has answered here their answer is the one that stands.
 *
 * A component of its own so that toggling this re-renders these four lines instead of the app.
 */
function MotionConfig() {
  const reduceMotion = useReduceMotion();

  return <ReducedMotionConfig mode={reduceMotion ? ReduceMotion.Always : ReduceMotion.Never} />;
}

export default function RootLayout() {
  // Nothing is rendered for this and nothing waits on it — the app is usable while it runs, and
  // usable if it fails. See the hook (BACKEND_PLAN.md §5).
  useEnsureGuestSession();

  return (
    <ApiProvider>
      {/* Inside ApiProvider because sync talks over the same tRPC client, and outside the
          navigator because it renders nothing and blocks nothing (BACKEND_PLAN.md §6). */}
      <SyncProvider>
        {/* The whole app's one reader of the preferences table. Above the navigator because what
            it publishes is read from every tab — how a note is spelled, whether motion is reduced —
            and a query per reader would be a dozen subscriptions answering the same question. */}
        <PreferencesProvider>
          {/* Renders nothing; it exists to hold the subscription, so that changing this
              setting re-renders one leaf rather than the whole app under it. */}
          <MotionConfig />
          {/* Alongside sync rather than inside it: content is public, so the catalogue refreshes
              whether or not a session exists yet (BACKEND_PLAN.md §8). */}
          <ContentProvider>
            <GestureRoot className="flex-1">
              {/* Outside the navigator so a sheet's backdrop covers the tab bar too,
              rather than being clipped to the screen that presented it. */}
              <BottomSheetModalProvider>
                <ThemeProvider value={DarkTheme}>
                  <StatusBar style="light" />
                  <Stack
                    screenOptions={() => ({
                      headerShown: false,
                      contentStyle: { backgroundColor: '#0c0d10' },
                      animation: pushAnimation(),
                    })}
                  >
                    <Stack.Screen name="quiz/[slug]" options={pagedInto} />
                    <Stack.Screen name="activity/[slug]" options={pagedInto} />
                    <Stack.Screen name="onboarding" options={overCover} />
                  </Stack>
                </ThemeProvider>
              </BottomSheetModalProvider>
              {/* Above every route and below anything the system puts up — which is the whole point
                of it being here and not in a window overlay, since what it usually waits for is a
                provider's sign-in sheet. */}
              <CoverHost />
              {/* Last, and outside the sheet provider, so on Android — where a modal
                route is an ordinary fragment — it is already above both. */}
              <ToastHost />
              {/* After the toasts, and so over them: the curtain takes the whole screen for a
                second or so, and a report poking out from behind it would be two things talking at
                once. A sign-out that failed raises its own toast from under here, which is the
                case that settles the order — the explanation should arrive with the screen it is
                explaining, as the curtain lifts, not through it. */}
              <CurtainHost />
            </GestureRoot>
          </ContentProvider>
        </PreferencesProvider>
      </SyncProvider>
    </ApiProvider>
  );
}
