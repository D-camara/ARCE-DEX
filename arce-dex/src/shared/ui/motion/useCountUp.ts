import { useEffect, useState } from 'react'
import { cubicBezier, MotionGlobalConfig, useReducedMotion } from 'motion/react'
import { duration as durations, ease } from './tokens'

const easeOut = cubicBezier(...ease.out)

/**
 * Counts from 0 up to `value` with the same duration and curve as the stat bars, so the
 * number and its bar fill together. Plain requestAnimationFrame on purpose: Motion's
 * imperative `animate()` would pull the whole engine into the main bundle (+12 KB gz).
 * With reduced motion on (or animations skipped, as in tests), returns `value` right away.
 */
export function useCountUp(value: number, durationInSeconds: number = durations.slow): number {
  const skip = useReducedMotion() === true || MotionGlobalConfig.skipAnimations === true
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (skip) {
      return
    }

    let frame = 0
    let start: number | null = null

    function tick(now: number) {
      start ??= now
      const progress = Math.min((now - start) / (durationInSeconds * 1000), 1)
      setDisplayed(Math.round(value * easeOut(progress)))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [durationInSeconds, skip, value])

  return skip ? value : displayed
}
