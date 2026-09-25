/**
 * Motion tokens — the single source for durations/easings (see docs/design-system/MASTER.md).
 * Entrances decelerate, exits accelerate and are ~65% as long, nothing loops except loaders.
 */
export const duration = {
  press: 0.12,
  fast: 0.18,
  base: 0.24,
  exit: 0.16,
  slow: 0.45,
} as const

export const ease = {
  out: [0.22, 1, 0.36, 1],
  in: [0.4, 0, 1, 1],
} as const

export const stagger = 0.04

export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
} as const

/** Fade + small rise in, quicker fade out. Reusable for panels, popovers, toasts. */
export const fadeRise = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: 4, transition: { duration: duration.exit, ease: ease.in } },
} as const
