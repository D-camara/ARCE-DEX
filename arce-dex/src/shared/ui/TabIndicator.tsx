import * as m from 'motion/react-m'
import { layoutTransition } from './motion'
import { cn } from '@/shared/lib/utils'

/**
 * The "selected" background of a tab/segmented button. Render it only inside the active
 * button: with a shared `layoutId`, Motion slides it from the old tab to the new one.
 * The button must be `relative isolate` (the indicator sits behind its label), and the bar
 * should be wrapped in its own `<LayoutGroup id>` so indicators never jump between bars.
 */
export function TabIndicator({ className, layoutId }: { className?: string; layoutId: string }) {
  return (
    <m.span
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-[-1px] -z-10 rounded-[inherit]', className)}
      layoutId={layoutId}
      transition={{ layout: layoutTransition }}
    />
  )
}
