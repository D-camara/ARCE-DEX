import type { PropsWithChildren } from 'react'

/** Muted, centered one-liner for "nothing here" / "loading…" / "couldn't load" spots. */
export function EmptyHint({ children }: PropsWithChildren) {
  return <p className="text-center italic tracking-wide text-muted opacity-80">{children}</p>
}
