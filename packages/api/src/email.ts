import { Resend } from 'resend';

import type { Env } from './env';

/**
 * Transactional email (BACKEND_PLAN.md §5). Only verification and password reset for now, both
 * driven by Better Auth.
 */
export interface Mailer {
  send(message: { to: string; subject: string; text: string }): Promise<void>;
}

export function createMailer(env: Env): Mailer {
  const from = env.EMAIL_FROM;
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey || !from) {
    // Local dev and tests: the link goes to the console instead of the request failing, so
    // email + password sign-up can be exercised end to end without a Resend key or a verified
    // sending domain. Deployed environments must set both — see .dev.vars.example.
    return {
      async send({ to, subject, text }) {
        console.log(`[email:dev] to=${to} subject=${subject}\n${text}`);
      },
    };
  }

  const resend = new Resend(apiKey);

  return {
    async send({ to, subject, text }) {
      const { error } = await resend.emails.send({ from, to, subject, text });

      // Resend reports failures in the body rather than by throwing, so an unchecked call would
      // let sign-up report success while no mail was ever sent.
      if (error) throw new Error(`resend: ${error.message}`);
    },
  };
}
