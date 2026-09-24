import { domAnimation } from 'motion/react'

// Loaded lazily by MotionProvider: animate/exit/gestures/variants, no layout animations
// (domMax would add ~14 KB gz — not worth it for this app).
export default domAnimation
