export { PreferencesProvider } from './provider';
// The non-React read, for the two callers that have no component to read from: the navigator
// deciding how a push should travel, and `lib/haptics`. Everything else should use a hook.
export { readPreferences } from './snapshot';
export {
  useAccidentalSide,
  usePreference,
  usePreferences,
  usePreferenceWriter,
  useReduceMotion,
  useTuning,
  type PreferenceWriter,
} from './usePreferences';
