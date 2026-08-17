import type { Env } from './env';

/**
 * Transactional SMS (BACKEND_PLAN.md §5). Only the phone sign-in code for now, driven by Better
 * Auth's phone-number plugin. Deliberately shaped like `Mailer` in `email.ts` — the two are the
 * same job down two different wires, and the OTP plugins treat them identically.
 */
export interface Texter {
  send(message: { to: string; body: string }): Promise<void>;
}

/** Twilio's REST endpoint for a single outbound message. */
function messagesUrl(accountSid: string): string {
  return `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
}

export function createTexter(env: Env): Texter {
  const { TWILIO_ACCOUNT_SID: accountSid, TWILIO_AUTH_TOKEN: authToken } = env;
  const from = env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    // Local dev and tests: the code goes to the console instead of the request failing, so phone
    // sign-up can be exercised end to end without a Twilio account. Deployed environments must set
    // all three — see .dev.vars.example.
    return {
      async send({ to, body }) {
        console.log(`[sms:dev] to=${to}\n${body}`);
      },
    };
  }

  return {
    async send({ to, body }) {
      // Twilio's own SDK pulls in Node builtins that workerd does not provide, and this is one
      // form-encoded POST — so it is written out rather than depended on.
      const response = await fetch(messagesUrl(accountSid), {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      });

      if (!response.ok) {
        // Twilio explains the failure in a JSON body; the status alone does not say whether the
        // number was unroutable or the account is out of credit, and that difference is the whole
        // content of the log line someone will be reading.
        const detail = await response.text().catch(() => '');
        throw new Error(`twilio: ${response.status} ${detail}`);
      }
    },
  };
}
