const { withInfoPlist, withAndroidManifest, createRunOncePlugin } = require('expo/config-plugins');

const withMicPermissions = (config) => {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.NSMicrophoneUsageDescription =
      cfg.modResults.NSMicrophoneUsageDescription ||
      'This app uses the microphone to detect the pitch of your guitar.';
    return cfg;
  });
  config = withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest;
    app['uses-permission'] = app['uses-permission'] || [];
    const has = app['uses-permission'].some(
      (p) => p.$['android:name'] === 'android.permission.RECORD_AUDIO',
    );
    if (!has) {
      app['uses-permission'].push({ $: { 'android:name': 'android.permission.RECORD_AUDIO' } });
    }
    return cfg;
  });
  return config;
};

module.exports = createRunOncePlugin(withMicPermissions, 'expo-pitch-detector', '1.0.0');
