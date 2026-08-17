/**
 * Which of the two things the flow says it is.
 *
 * Not two flows. Signing in and signing up are the same act here — a code or a provider token
 * proves who someone is, the server decides whether an account already existed, and `nextStep`
 * reads what to do next off the account that comes back. So neither framing can do anything the
 * other cannot: someone who logs in with an address nobody has used gets an account and the rest of
 * the questions, and someone who "creates" one with an address that already exists is simply let
 * back in.
 *
 * What is left is wording, and one link across. That is all a mode is, which is why it is a table
 * of strings rather than a branch anywhere in the flow.
 */
export type OnboardingMode = 'create' | 'login';

interface Framing {
  /** The first step's heading. */
  title: string;
  blurb: string;
  /** What the other framing is called, on the link that switches to it. */
  other: string;
}

export const FRAMING: Record<OnboardingMode, Framing> = {
  create: {
    title: 'Create your account',
    blurb: 'We’ll send you a code to confirm it’s you. No password to remember.',
    other: 'Log in',
  },
  login: {
    title: 'Welcome back',
    blurb: 'Enter your email or phone and we’ll send you a code. No password to remember.',
    other: 'Create account',
  },
};

export const OTHER_MODE: Record<OnboardingMode, OnboardingMode> = {
  create: 'login',
  login: 'create',
};

/**
 * The mode a route param asked for. Anything unrecognised — a missing param, a stale link — is
 * `create`, which is the framing that assumes least about who is arriving.
 */
export function parseMode(value: unknown): OnboardingMode {
  return value === 'login' ? 'login' : 'create';
}
