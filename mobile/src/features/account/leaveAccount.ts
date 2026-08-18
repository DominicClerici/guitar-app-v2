import { curtain } from '@/features/curtain';
import { authClient, describeAuthError } from '@/lib/auth';
import { toast } from '@/lib/toast';

/**
 * Signing out, played rather than performed.
 *
 * What changes when a session goes is everything: the account card becomes the pitch, the settings
 * rows underneath it go, and a guest account is made to replace what was signed out of. Any of
 * that showing through a half-drawn curtain is a flash, so none of it may happen until the curtain
 * is all the way down.
 *
 * The obvious refinement — send the request at the press and only apply the answer once covered —
 * is not available, and the reason is worth writing down because it is invisible from the call
 * site. `@better-auth/expo` clears its session cache from the *request* hook, before the fetch is
 * sent, and clearing it does not merely empty the keychain: it sets the client's session atom to
 * null then and there. The screen is therefore repainted by asking to sign out, not by being
 * signed out, and no amount of care with the response can hold it back. (`disableSignal`, which
 * suppresses the client's post-response session signal, is answering a different question.)
 *
 * So the whole call waits for the cover. It costs the request the four hundred milliseconds the
 * curtain takes to fall, which is four hundred milliseconds of a beat that lasts one and a half
 * seconds and that nothing is waiting on — and it buys the guarantee that nothing underneath can
 * move while it can still be seen.
 */
export function leaveAccount({ onCovered }: { onCovered?: () => void } = {}): void {
  curtain({
    kind: 'leaving',
    onCovered: () => {
      onCovered?.();
      void signOut();
    },
  });
}

async function signOut(): Promise<void> {
  try {
    const { error } = await authClient.signOut();
    if (!error) return;

    // The device is signed out either way — the keychain was emptied on the way out, before the
    // request that failed — so this is not an offer to try again but a note that the server has
    // not heard about it yet. Said as a toast because by now the sheet that asked is gone, and it
    // arrives as the curtain lifts rather than through it.
    toast.error(describeAuthError(error));
  } catch {
    // Better Auth answers with failures rather than throwing, so a rejection is something
    // unaccounted for. It is still not something to say nothing about.
    toast.error(describeAuthError(null));
  }
}
