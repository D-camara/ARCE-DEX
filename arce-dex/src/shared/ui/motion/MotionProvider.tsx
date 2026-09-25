import type { PropsWithChildren } from 'react'
import { LazyMotion, MotionConfig } from 'motion/react'

const loadFeatures = () => import('./features').then((module) => module.default)

/**
 * App-wide motion setup:
 * - LazyMotion + `m` components keep the animation engine out of the critical path, and
 *   `strict` throws if someone uses the full `motion.*` components by mistake.
 * - reducedMotion="user": with the OS "reduce motion" setting on, transforms are skipped
 *   and elements appear in their final state.
 */
export function MotionProvider({ children }: PropsWithChildren) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
