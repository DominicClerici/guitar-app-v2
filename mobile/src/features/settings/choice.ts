/**
 * What a control shows between the moment you pick something and the moment the database says so.
 *
 * A preference write is local and synchronous, so it is already saved by the time the handler
 * returns — but the read side is `useLiveQuery`, which learns about the write from a native change
 * event a beat later. Left to that alone, the pill would sit still under the finger and then jump.
 * So the choice is shown immediately and the stored value is allowed to catch up.
 *
 * The pending choice remembers what it was made *from*, which is the whole trick: it is not held
 * until some acknowledgement arrives, it is held until the store stops saying what it said. That
 * covers being answered (the write lands, stored becomes the new value) and being overtaken (a
 * pull from another device sets something else) with one comparison, and it cannot strand a
 * control on a value nothing agrees with — the worst case is one frame late, never permanent.
 *
 * A write that is refused needs none of this: nothing was stored, so dropping the pending choice
 * puts the control back on the value it never really left.
 */

/** A choice made but not yet seen in the store, and the stored value it was made from. */
export interface Pending<T> {
  value: T;
  from: T;
}

/** The value a control should display: the pending choice while it still stands, else the store. */
export function shownChoice<T>(stored: T, pending: Pending<T> | null): T {
  return pending !== null && pending.from === stored ? pending.value : stored;
}

/**
 * Whether a pending choice has been answered and should be dropped — the store has moved off what
 * the choice was made from, whichever way it moved.
 */
export function isSettled<T>(stored: T, pending: Pending<T> | null): boolean {
  return pending !== null && pending.from !== stored;
}
