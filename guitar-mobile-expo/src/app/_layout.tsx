import '@/global.css';

import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { withUniwind } from 'uniwind';

const GestureRoot = withUniwind(GestureHandlerRootView);

export default function RootLayout() {
  return (
    <GestureRoot className="flex-1">
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0c0d10' } }}
        />
      </ThemeProvider>
    </GestureRoot>
  );
}
