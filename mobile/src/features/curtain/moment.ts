/**
 * What the curtain says, and how long it is down for.
 *
 * Kept apart from the screen that plays it so the three things worth pinning down can be: which of
 * the moments an account is having, that nobody is ever addressed by a name they did not give, and
 * the shape of the beat itself. The callers need the timings too — what the curtain covers up is
 * work they are doing behind it, and they have to know when they are hidden.
 */

/**
 * The three moments an account changes hands, and the two directions they run in.
 *
 * `returning` and `new` are not "signed in" versus "signed up", which is how they were reached — a
 * returning account that never finished onboarding finishes it now, and is being welcomed *to* the
 * app for the first time however many times it has signed in before. What separates them is
 * whether this is the moment the account became complete.
 */
export type CurtainKind = 'returning' | 'new' | 'leaving';

/**
 * The two ways in, which greet somebody by name, and the one way out, which has nobody left to
 * greet — the account is being put down, and using its name on the way would be familiar in the
 * wrong direction.
 */
export type Moment = { kind: 'returning' | 'new'; name: string } | { kind: 'leaving' };

/** The half of it a finished sign-in produces. */
export type Arrival = Extract<Moment, { name: string }>;

/** Standing in until the app is named. One constant, so naming it is one edit. */
export const APP_NAME = 'Guitar-app';

/**
 * How long the curtain takes to come down over a screen that was in use. Only the way out needs
 * it: everything else opens onto a screen that is already black.
 */
export const COVER_MS = 400;

/** The mark, played through once in whichever direction the moment runs. */
export const PLAY_MS = 600;

/** The beat it holds with nothing moving, so the last frame is read rather than glimpsed. */
export const HOLD_MS = 250;

/** The way out, always onto something worth seeing. */
export const HIDE_MS = 400;

export interface Timing {
  /**
   * How long the backdrop takes to go opaque, and so how long until the caller may change anything
   * underneath. Zero where what is underneath is already black, in which case the cover is simply
   * there from the first frame — there is nothing to fade up from, and a fade would only delay the
   * moment the screen can be worked on unseen.
   */
  coverMs: number;
  /**
   * When the mark starts moving: once the curtain owns the screen. Going out that is a wait, and
   * deliberately — a mark that undoes itself has to be seen whole first, or there is nothing to
   * read the undoing against.
   */
  playAt: number;
  /** Whether the mark runs backwards. */
  reverse: boolean;
  /** The whole of it, which is how long the screen underneath is spoken for. */
  totalMs: number;
}

export function timing(kind: CurtainKind): Timing {
  const leaving = kind === 'leaving';
  const coverMs = leaving ? COVER_MS : 0;

  return {
    coverMs,
    playAt: coverMs,
    reverse: leaving,
    totalMs: coverMs + PLAY_MS + HOLD_MS + HIDE_MS,
  };
}

/**
 * What to call someone, given whatever they typed into the name field.
 *
 * The first word of it: "Welcome back, Dominic" is a greeting and "Welcome back, Dominic Clerici"
 * is a form letter, and the field takes a full name because that is what the rest of the account
 * wants.
 */
export function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? '';
}

export function momentText(moment: Moment): string {
  if (moment.kind === 'leaving') return 'Signing you out';

  const opening = moment.kind === 'returning' ? 'Welcome back' : `Welcome to ${APP_NAME}`;
  const first = firstName(moment.name);

  // No name is not a case to apologise for or to fill with a placeholder — the sentence simply
  // stops where the name would have been, and still reads.
  return first ? `${opening}, ${first}` : opening;
}
