import * as WebBrowser from 'expo-web-browser';

/**
 * The two documents an account is agreed against.
 *
 * Placeholders until the real pages are published — they are here rather than written into the step
 * that links them so that swapping them is one edit, and so the Account tab can link the same two
 * without a second copy drifting from this one.
 */
export const TERMS_URL = 'https://example.com/terms';
export const PRIVACY_URL = 'https://example.com/privacy';

/**
 * Opens one of them in the in-app browser rather than handing off to Safari.
 *
 * Which matters more here than it looks: these are linked from the middle of onboarding, and a
 * hand-off to another app is a way of losing someone three screens into a flow they had nearly
 * finished. A sheet they can dismiss puts them back exactly where they were.
 *
 * Failures are swallowed. Nothing the flow does depends on the page having opened, and there is no
 * useful thing to tell someone whose device declined to show a web page.
 */
export async function openLegalDocument(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    // Nothing to recover, and nothing to say.
  }
}
