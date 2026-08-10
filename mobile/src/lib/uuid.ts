/**
 * Client-generated UUIDv7 (RFC 9562 §5.7).
 *
 * A quiz attempt is an append-only row whose id is minted on the device, before the server has
 * ever seen it (BACKEND_PLAN.md §7, sync/tables/attempts.ts). Two properties matter and neither is
 * cosmetic: the id must not collide with one minted on another device offline, and it must sort by
 * the moment it was made, because the sync tables use the id as the primary key and a random v4
 * would scatter inserts across the index.
 *
 * Written here rather than pulled from npm: `uuid` is not a dependency of this app, and the whole
 * generator is thirty lines of byte packing.
 *
 * Layout, most significant first:
 *   48 bits  Unix milliseconds
 *    4 bits  version (7)
 *   12 bits  sub-millisecond counter — `rand_a` used as method 1 of §6.2
 *    2 bits  variant (0b10)
 *   62 bits  random
 */

/** Last millisecond a value was minted for, and how many have been minted within it. */
let lastMs = 0;
let counter = 0;

/** Largest value the 12-bit counter holds before the millisecond has to be borrowed against. */
const COUNTER_MAX = 0xfff;

type RandomSource = { getRandomValues?: (into: Uint8Array) => void };

/**
 * Fills `into` with random bytes, preferring the platform CSPRNG.
 *
 * `Math.random` is the fallback rather than the failure case: Hermes ships no `crypto` global and
 * this app has no polyfill for one, so on device the fallback is the live path. That is acceptable
 * *here* — these bits guard against two devices minting an attempt in the same millisecond, not
 * against an attacker — and would not be acceptable for a token or a key.
 */
function fillRandom(into: Uint8Array): void {
  const source = (globalThis as { crypto?: RandomSource }).crypto;

  if (source?.getRandomValues) {
    source.getRandomValues(into);
    return;
  }

  for (let index = 0; index < into.length; index += 1) {
    into[index] = Math.floor(Math.random() * 256);
  }
}

const HEX = '0123456789abcdef';

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let index = 0; index < bytes.length; index += 1) {
    const byte = bytes[index];
    out += HEX[byte >> 4] + HEX[byte & 0x0f];
    if (index === 3 || index === 5 || index === 7 || index === 9) out += '-';
  }
  return out;
}

/**
 * A new UUIDv7. Values from one runtime are strictly increasing, in the order they were minted,
 * even when several are taken inside the same millisecond or the system clock steps backwards —
 * the timestamp never goes below the last one used, and the counter breaks the tie beneath it.
 *
 * `now` is a seam for tests; callers pass nothing.
 */
export function uuidv7(now: number = Date.now()): string {
  // A clock that stepped back would otherwise mint an id sorting before ids already written.
  let ms = Math.max(Math.floor(now), lastMs);

  if (ms === lastMs) {
    counter += 1;
    // More than 4096 in one millisecond: borrow from the next one rather than repeat a value.
    if (counter > COUNTER_MAX) {
      ms += 1;
      counter = 0;
    }
  } else {
    counter = 0;
  }

  lastMs = ms;

  const bytes = new Uint8Array(16);
  fillRandom(bytes);

  // Divisions rather than shifts: the timestamp is 48 bits and `>>` works on 32.
  bytes[0] = Math.floor(ms / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(ms / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(ms / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(ms / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(ms / 2 ** 8) & 0xff;
  bytes[5] = ms & 0xff;

  bytes[6] = 0x70 | ((counter >> 8) & 0x0f);
  bytes[7] = counter & 0xff;
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  return toHex(bytes);
}
