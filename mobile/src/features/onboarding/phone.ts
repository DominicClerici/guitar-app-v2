import { isE164 } from '@guitar/shared';

/**
 * The phone field, as arithmetic on strings.
 *
 * A number is collected in two parts — a country code and the rest — because that is how someone
 * reads their own number off a card, but it is only ever stored, sent, or compared as one E.164
 * string. Everything here is pure so the field can be exercised without a device.
 */

/** What the code starts at. Changing it is a one-line change with no other consequence. */
export const DEFAULT_DIAL_CODE = '+1';

/** No country code is longer than this. */
const MAX_DIAL_DIGITS = 3;

/**
 * The shortest national number worth sending a code to.
 *
 * E.164 itself only bounds the total at fifteen, so it accepts `+1555` — which is not a number
 * anyone has, but is what a half-typed one looks like. There is no floor that is right everywhere;
 * six is under every SMS-capable mobile number in use and still rejects an obvious fragment.
 */
const MIN_NATIONAL_DIGITS = 6;

/** North American numbers, the one grouping worth knowing without a country database. */
const NANP_LENGTH = 10;

export function nationalDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * The country code as it should look after a keystroke: a plus and up to three digits.
 *
 * A leading zero is dropped rather than shown, because E.164 has no country code beginning with
 * one — someone typing the `0` of a national trunk prefix out of habit gets nothing rather than a
 * number that will be rejected several screens later.
 */
export function sanitizeDialCode(raw: string): string {
  const digits = nationalDigits(raw).replace(/^0+/, '');
  return `+${digits.slice(0, MAX_DIAL_DIGITS)}`;
}

export function toE164(dialCode: string, national: string): string {
  return `${sanitizeDialCode(dialCode)}${nationalDigits(national)}`;
}

/**
 * Whether there is enough here to send a code to.
 *
 * The two halves are checked separately before being joined. Concatenation alone would let an
 * empty country code pass a full national number off as one — `+` and `5551234567` make a
 * well-formed `+5551234567` addressed to a country that is not the one it was typed for.
 */
export function isCompletePhone(dialCode: string, national: string): boolean {
  const digits = nationalDigits(national);
  if (sanitizeDialCode(dialCode) === '+') return false;
  if (digits.length < MIN_NATIONAL_DIGITS) return false;
  return isE164(toE164(dialCode, digits));
}

/**
 * The number as it is shown while being typed. Only `+1` is grouped: every other country's
 * convention would need a database to know, and a wrong grouping reads worse than none.
 */
export function formatNational(dialCode: string, national: string): string {
  const digits = nationalDigits(national);
  if (sanitizeDialCode(dialCode) !== DEFAULT_DIAL_CODE) return digits;

  const [area, exchange, line] = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, NANP_LENGTH),
  ];

  if (!exchange) return area;
  if (!line) return `(${area}) ${exchange}`;
  return `(${area}) ${exchange}-${line}`;
}
