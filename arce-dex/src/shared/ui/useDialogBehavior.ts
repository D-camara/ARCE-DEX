import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Dialogs can stack (the header stays clickable above an open modal). Only the topmost one
// reacts to keys, and the page stays locked until the last one closes.
const openDialogs: HTMLElement[] = []
let bodyOverflowBeforeLock = ''

function getFocusable(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
}

/**
 * Modal behavior shared by every dialog/drawer: Esc closes, focus moves inside on open,
 * Tab stays inside while open, focus returns to whatever opened it, and the page behind
 * doesn't scroll.
 */
export function useDialogBehavior(isOpen: boolean, onClose: () => void, containerRef: RefObject<HTMLElement | null>) {
  // Callers pass inline arrows; keep the latest one without re-running the effect (which
  // would steal focus back to the first element on every render).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const container = containerRef.current
    if (!isOpen || !container) {
      return
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    getFocusable(container)[0]?.focus({ preventScroll: true })

    if (openDialogs.length === 0) {
      bodyOverflowBeforeLock = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openDialogs.push(container)

    function handleKeyDown(event: KeyboardEvent) {
      if (openDialogs[openDialogs.length - 1] !== container) {
        return
      }

      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !container) {
        return
      }

      const focusable = getFocusable(container)
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      openDialogs.splice(openDialogs.indexOf(container), 1)
      if (openDialogs.length === 0) {
        document.body.style.overflow = bodyOverflowBeforeLock
      }
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [isOpen, containerRef])
}
