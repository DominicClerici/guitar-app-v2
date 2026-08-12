import '@/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { withUniwind } from 'uniwind';

import { ApiProvider } from '@/lib/api';
import { useEnsureGuestSession } from '@/lib/auth';
import { ContentProvider } from '@/lib/content-cache';
import { SyncProvider } from '@/lib/sync';

const GestureRoot = withUniwind(GestureHandlerRootView);

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
      (route.params as { enter?: string } | undefined)?.enter === 'fade' ? 'none' : 'default',
  }) as const;

export default function RootLayout() {
  // Nothing is rendered for this and nothing waits on it — the app is usable while it runs, and
  // usable if it fails. See the hook (BACKEND_PLAN.md §5).
  useEnsureGuestSession();

  return (
    <ApiProvider>
      {/* Inside ApiProvider because sync talks over the same tRPC client, and outside the
          navigator because it renders nothing and blocks nothing (BACKEND_PLAN.md §6). */}
      <SyncProvider>
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
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#0c0d10' },
                  }}
                >
                  <Stack.Screen name="quiz/[slug]" options={pagedInto} />
                  <Stack.Screen name="activity/[slug]" options={pagedInto} />
                </Stack>
              </ThemeProvider>
            </BottomSheetModalProvider>
          </GestureRoot>
        </ContentProvider>
      </SyncProvider>
    </ApiProvider>
  );
}
