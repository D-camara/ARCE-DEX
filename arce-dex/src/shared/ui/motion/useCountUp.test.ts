import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MotionGlobalConfig } from 'motion/react'
import { useCountUp } from './useCountUp'

describe('useCountUp', () => {
  beforeEach(() => {
    MotionGlobalConfig.skipAnimations = false
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    MotionGlobalConfig.skipAnimations = true
  })

  it('counts from 0 up to the value and stops exactly on it', () => {
    const { result } = renderHook(() => useCountUp(120, 0.4))
    expect(result.current).toBe(0)

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(120)

    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe(120)
  })

  it('restarts when the value changes', () => {
    const { rerender, result } = renderHook(({ value }) => useCountUp(value, 0.4), {
      initialProps: { value: 50 },
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current).toBe(50)

    rerender({ value: 90 })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current).toBe(90)
  })

  it('returns the final value right away when animations are skipped', () => {
    MotionGlobalConfig.skipAnimations = true
    const { result } = renderHook(() => useCountUp(88))
    expect(result.current).toBe(88)
  })
})
