import { useRef, type PropsWithChildren } from 'react'
import { useDialogBehavior } from './useDialogBehavior'

type DialogProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  /** id of the element that names the dialog (usually its heading). */
  labelledBy: string
  /** Panel look (size, background, border…). Behavior and overlay come from here. */
  className?: string
}>

/** Centered on desktop, bottom sheet on mobile. Closes on Esc and on a click outside the panel. */
export function Dialog({ isOpen, onClose, labelledBy, className, children }: DialogProps) {
  const panelRef = useRef<HTMLElement>(null)
  useDialogBehavior(isOpen, onClose, panelRef)

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[34] grid items-end bg-abyss/64 p-2.5 md:items-center"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        ref={panelRef}
        className={['mx-auto grid', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    </div>
  )
}
