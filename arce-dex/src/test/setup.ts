import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'

// Tests assert end states (a dialog is gone after Esc): skip animation timing entirely.
MotionGlobalConfig.skipAnimations = true

afterEach(() => {
  cleanup()
})
