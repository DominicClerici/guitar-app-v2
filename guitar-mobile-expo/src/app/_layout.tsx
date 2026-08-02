import '@/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { withUniwind } from 'uniwind';

const GestureRoot = withUniwind(GestureHandlerRootView);

export default function RootLayout() {
  return (
    <GestureRoot className="flex-1">
      {/* Outside the navigator so a sheet's backdrop covers the tab bar too,
          rather than being clipped to the screen that presented it. */}
      <BottomSheetModalProvider>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0c0d10' } }}
          />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureRoot>
  );
}
