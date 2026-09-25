import { useRef, type PropsWithChildren } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { duration, ease } from './motion/tokens'
import { useDialogBehavior } from './useDialogBehavior'

type DialogProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  /** id of the element that names the dialog (usually its heading). */
  labelledBy: string
  /** Panel look (size, background, border…). Behavior and overlay come from here. */
  className?: string
}>

/**
 * Centered on desktop, bottom sheet on mobile. Closes on Esc and on a click outside the panel.
 * Enters by rising from where it sits (bottom on phones), leaves faster than it came.
 * `propagate`: when the parent unmounts the whole dialog (e.g. `{open && <AuthForm />}` inside
 * an AnimatePresence), the exit animation still runs instead of the dialog vanishing.
 */
export function Dialog({ isOpen, onClose, labelledBy, className, children }: DialogProps) {
  const panelRef = useRef<HTMLElement>(null)
  useDialogBehavior(isOpen, onClose, panelRef)

  return (
    <AnimatePresence propagate>
      {isOpen && (
        <m.div
          key="dialog-overlay"
          className="fixed inset-0 z-[1100] grid items-end bg-abyss/64 p-2.5 md:items-center"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
          exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.in } }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose()
            }
          }}
        >
          <m.section
            ref={panelRef}
            className={['mx-auto grid', className].filter(Boolean).join(' ')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ y: 24, scale: 0.98 }}
            animate={{ y: 0, scale: 1, transition: { duration: duration.base, ease: ease.out } }}
            exit={{ y: 12, transition: { duration: duration.exit, ease: ease.in } }}
          >
            {children}
          </m.section>
        </m.div>
      )}
    </AnimatePresence>
  )
}
