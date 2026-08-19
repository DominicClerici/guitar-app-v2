export { ThemeConfig } from './ThemeConfig';
export { ThemeSwitchHost } from './ThemeSwitchHost';
// The page colour as a value, for the two places that take a colour rather than a class and read
// it once: the navigator's `contentStyle`, and the native root behind the app.
export { themeBackground } from './apply';
export { beginThemeSwitch, prepareThemeSwitch } from './switch';
