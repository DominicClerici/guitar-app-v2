module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // drizzle/migrations.js imports the .sql files as strings; without this they reach
    // the JS parser and blow up on the first CREATE TABLE (BACKEND_PLAN.md §6).
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
