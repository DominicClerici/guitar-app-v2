import type { ExpoConfig } from 'expo/config';

/**
 * A config file rather than `app.json` because one plugin has to be conditional.
 *
 * `@react-native-google-signin/google-signin` requires the reversed iOS client id as a URL scheme
 * at build time, and there is no placeholder that fails usefully — a wrong one builds fine and
 * then does nothing at the moment someone taps the button. So the plugin appears only once the id
 * is set, which is the same rule the Worker applies to the provider's server half (see
 * `socialProviders` in `packages/api/src/auth.ts`): a developer without OAuth apps gets a working
 * app with two of the three ways in, rather than a build failure or a dead button.
 */

/**
 * The URL scheme Google's native module registers, which is the iOS client id written backwards:
 * `1234-abcd.apps.googleusercontent.com` becomes `com.googleusercontent.apps.1234-abcd`.
 *
 * Derived rather than configured. It is a pure rewriting of a value we already have, and asking
 * for both invites setting them to the same string — which builds a plugin that rejects it, or
 * worse, registers a scheme nothing ever calls back on.
 */
const GOOGLE_CLIENT_SUFFIX = '.apps.googleusercontent.com';

function reversedClientId(clientId: string | undefined): string | undefined {
  if (!clientId?.endsWith(GOOGLE_CLIENT_SUFFIX)) return undefined;
  return `com.googleusercontent.apps.${clientId.slice(0, -GOOGLE_CLIENT_SUFFIX.length)}`;
}

const googleIosUrlScheme = reversedClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);

const plugins: NonNullable<ExpoConfig['plugins']> = [
  'expo-router',
  [
    'expo-splash-screen',
    {
      backgroundColor: '#208AEF',
      image: './assets/images/splash-icon.png',
      imageWidth: 76,
    },
  ],
  'expo-web-browser',
  './modules/expo-pitch-detector/plugin/build.js',
  'react-native-audio-api',
  'expo-secure-store',
  // Adds the Sign in with Apple entitlement. Unconditional: it needs no credentials of its own,
  // and the capability is what the native sheet checks for.
  'expo-apple-authentication',
];

if (googleIosUrlScheme) {
  plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]);
}

const config: ExpoConfig = {
  name: 'guitar-mobile-expo',
  slug: 'guitar-mobile-expo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'guitarmobileexpo',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.dominicrumor.guitar-mobile-expo',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins,
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
