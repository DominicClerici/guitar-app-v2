/** Enough of a user to write an avatar for. */
export interface Nameable {
  name: string;
  email: string;
}

/**
 * Up to two initials from the name, falling back to the address when there is no name.
 *
 * Its own module because two surfaces now draw the same avatar — the profile and the home-screen
 * header — and initials that disagreed between them would read as two different accounts.
 */
export function initials({ name, email }: Nameable): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word[0]);
  return (letters.length ? letters.join('') : email.slice(0, 1)).toUpperCase();
}
