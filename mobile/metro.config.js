const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// The device's SQLite migrations are bundled as source: drizzle/migrations.js imports each .sql
// file, and Metro only resolves extensions it has been told about (BACKEND_PLAN.md §6).
config.resolver.sourceExts.push('sql');

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-env.d.ts',
});
