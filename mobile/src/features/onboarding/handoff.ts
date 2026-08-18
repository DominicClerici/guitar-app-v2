import type { useRouter } from 'expo-router';

import { clearCover, curtain, isCovered, lowerCover, raiseCover } from '@/features/curtain';
import { SOCIAL_CANCELLED, type SocialResult } from '@/lib/auth';

import { landingFor } from './landing';
import { handOffToOnboarding } from './route';

type Router = ReturnType<typeof useRouter>;

/**
 * A provider pressed somewhere that is not the flow.
 *
 * The account screen offers Apple and Google next to the two buttons that open onboarding, and
 * until now they were a third and fourth way of opening it — the same provider had to be pressed
 * again on the step inside. So this signs in where it stands, and what the flow is for afterwards
 * is whatever the account turns out to still owe.
 *
 * The cover is what makes that one movement instead of two screens. It goes up as the sheet does,
 * and everything that happens between then and the end — the sheet, the round trip, a route being
 * pushed — happens behind it. What the person sees is the screen they pressed on giving way, and
 * then whichever of the three endings they earned:
 *
 * - nothing owed, so the welcome plays over the cover and the account tab is signed in underneath
 *   by the time it lifts;
 * - something owed, so the flow arrives at that step and fades up as the cover goes;
 * - nothing signed in, so the cover comes back down on the screen it was raised from — silently for
 *   a sheet that was dismissed, and into the flow's own first step for a failure, which is the one
 *   place an auth error has somewhere to be shown.
 */
export async function continueWithProvider(
  router: Router,
  run: () => Promise<SocialResult>,
): Promise<void> {
  // The cover swallows touches from the frame it goes up, so this is only reachable by two fingers
  // landing on two providers in the same one — but two sheets over one screen is a state neither of
  // them could get out of, and the guard is a line. It stands in for the flow's own `begin`, which
  // refuses a second move for exactly as long as the first is running.
  if (isCovered()) return;

  raiseCover();

  const result = await run();

  if (!result.ok) {
    // A cancelled sheet is a decision, not a failure. The screen comes back and says nothing.
    if (result.error === SOCIAL_CANCELLED) {
      lowerCover();
      return;
    }

    handOffToOnboarding(router, { at: 'account', failed: result.error });
    return;
  }

  const landing = landingFor(result.user);

  if (landing.greeting) {
    // Opaque from its first frame, since what it opens onto is the cover — so the cover can go the
    // moment it is up, and the two of them are one unbroken screen.
    curtain({ ...landing.greeting, onCovered: clearCover });
    return;
  }

  if (landing.step === 'account') {
    lowerCover();
    return;
  }

  handOffToOnboarding(router, { at: landing.step });
}
