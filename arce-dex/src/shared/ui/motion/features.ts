import { domMax } from 'motion/react'

// Loaded lazily by MotionProvider, after first paint: animate/exit/gestures/variants plus
// layout animations (layout, layoutId) and drag. Measured: the main bundle stays the same
// (+0.1 KB gz); this async chunk goes from 14.6 KB (domAnimation) to 28.1 KB gz.
export default domMax
