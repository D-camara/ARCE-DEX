import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, useDragControls, useMotionValue, type PanInfo, type Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { ArrowDownUp, ArrowLeft, ArrowRight, Check, GripVertical } from 'lucide-react'
import { duration, ease, layoutTransition, stagger } from '@/shared/ui'
import type { Team, TeamSlot } from '@/shared/types/team'
import { slotRenderKeys } from '../lib/slotKeys'
import { useTeamHighlightStore } from '../store/teamHighlightStore'
import { TeamSlotCard } from './TeamSlotCard'

type TeamSlotGridProps = {
  team: Team
  selectedSlotIndex: number
  /** True right after "Limpar": the cards leave one after the other instead of all at once. */
  isClearing: boolean
  /** Last team whose slots already entered in sequence (kept by the parent across tab switches). */
  staggeredTeamId: string | null
  onStaggered: (teamId: string) => void
  onEdit: (slotIndex: number) => void
  onRemove: (slotIndex: number) => void
  onMoveSlot: (fromIndex: number, toIndex: number) => void
}

/** Built per slot so the exit can stagger by position; `custom` (isClearing) arrives at exit time. */
function slotVariants(index: number): Variants {
  return {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
    // Fading in without the rise: returning to the tab, or an empty slot replacing a card.
    fadeIn: { opacity: 1, y: 0, transition: { duration: duration.fast, ease: ease.out } },
    exit: (isClearing: boolean) => ({
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: duration.exit,
        ease: ease.in,
        delay: isClearing ? (5 - index) * 0.02 : 0,
      },
    }),
  }
}

/** Distance from the top/bottom of the viewport at which dragging scrolls the page. */
const AUTO_SCROLL_EDGE = 72
const AUTO_SCROLL_STEP = 14
/** How far the finger must travel toward an edge before that edge scrolls (a card grabbed
 *  near the bottom must not start scrolling the page by itself). */
const AUTO_SCROLL_INTENT = 16

type DragHandlers = {
  onDragStart: (slotKey: string) => void
  onDrag: (slotKey: string, info: PanInfo) => void
  onDragEnd: (slotKey: string) => void
}

type SlotItemProps = DragHandlers & {
  /** Renders the card; gets the drag handle (null when this slot can't be dragged). */
  renderCard: (dragHandle: ReactNode) => ReactNode
  slot: TeamSlot
  slotKey: string
  displayIndex: number
  isOrganizing: boolean
  isDragging: boolean
  isClearing: boolean
  shouldStagger: boolean
  layoutKey: string
  glow: boolean
  onGlowDone: () => void
  registerElement: (slotKey: string, element: HTMLDivElement | null, controls: SlotControls) => void
}

/** What the grid can do to one slot while it is being dragged. */
type SlotControls = { shiftY: (dy: number) => void; stopDrag: () => void }

/** One slot of the grid. Owns its drag controls (a hook per slot, hence a component). */
function SlotItem({
  displayIndex,
  glow,
  isClearing,
  isDragging,
  isOrganizing,
  layoutKey,
  onDrag,
  onDragEnd,
  onDragStart,
  onGlowDone,
  registerElement,
  renderCard,
  shouldStagger,
  slot,
  slotKey,
}: SlotItemProps) {
  const dragControls = useDragControls()
  // Our own y so auto-scroll can keep the card under the finger while the page moves.
  const y = useMotionValue(0)
  const canDrag = isOrganizing && slot.pokemon !== null
  const ref = useCallback(
    (element: HTMLDivElement | null) =>
      registerElement(slotKey, element, {
        shiftY: (dy) => y.set(y.get() + dy),
        stopDrag: () => dragControls.stop(),
      }),
    [dragControls, registerElement, slotKey, y],
  )

  return (
    <m.div
      animate={shouldStagger ? 'visible' : 'fadeIn'}
      aria-label={slot.pokemon ? undefined : `Slot ${displayIndex + 1} vazio`}
      // grid: the card inside stretches to the row height, like it did as a direct grid item.
      // While dragged: above the others, opaque (the card background is translucent) and lifted.
      className={
        isDragging
          ? 'relative z-20 grid rounded-2xl bg-cosmic-soft shadow-[0_24px_48px_rgba(0,0,0,0.65)]'
          : 'relative grid'
      }
      custom={isClearing}
      data-slot-id={slot.pokemon ? undefined : slot.id}
      data-slot-key={slotKey}
      drag={canDrag}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragSnapToOrigin
      exit="exit"
      initial={shouldStagger ? undefined : { opacity: 0 }}
      layout="position"
      // Only who-is-where changes slide slots, not details (stats, moves) loading in.
      layoutDependency={layoutKey}
      onDrag={(_, info) => onDrag(slotKey, info)}
      onDragEnd={() => onDragEnd(slotKey)}
      onDragStart={() => onDragStart(slotKey)}
      ref={ref}
      role={slot.pokemon ? undefined : 'group'}
      style={{ y }}
      tabIndex={slot.pokemon ? undefined : -1}
      transition={{ layout: layoutTransition }}
      variants={slotVariants(displayIndex)}
      whileDrag={{ scale: 1.03 }}
    >
      {renderCard(
        canDrag ? (
          // Drag only starts from this handle (touch-action: none here only), so a finger on the
          // rest of the card still scrolls the page. Pointer-only: keyboard uses Antes/Depois.
          <span
            aria-hidden="true"
            className="grid min-h-11 w-11 cursor-grab touch-none place-items-center rounded-control border border-parchment/15 bg-panel/80 text-ivory-soft active:cursor-grabbing"
            data-drag-handle
            onPointerDown={(event) => {
              event.preventDefault()
              dragControls.start(event)
            }}
          >
            <GripVertical size={18} />
          </span>
        ) : null,
      )}
      {glow && (
        <m.span
          animate={{ opacity: [0, 1, 0] }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-gilt/70 shadow-glow-gold"
          initial={{ opacity: 0 }}
          onAnimationComplete={onGlowDone}
          transition={{ delay: 0.3, duration: duration.flash, ease: ease.out, times: [0, 0.3, 1] }}
        />
      )}
    </m.div>
  )
}

export function TeamSlotGrid({
  isClearing,
  onEdit,
  onMoveSlot,
  onRemove,
  onStaggered,
  selectedSlotIndex,
  staggeredTeamId,
  team,
}: TeamSlotGridProps) {
  // The 6 slots enter in sequence when a team is first shown (or another team is picked);
  // coming back from the Analysis tab just fades them in.
  const shouldStagger = staggeredTeamId !== team.id
  // The slot filled from the Pokédex glows once. Read at mount (pure), cleared right after.
  const [recentlyAdded, setRecentlyAdded] = useState(() => useTeamHighlightStore.getState().recentlyAdded)
  const [isOrganizing, setIsOrganizing] = useState(false)
  // While dragging, the order lives here (indices into team.slots); the store is written once, on drop.
  const [dragOrder, setDragOrder] = useState<number[] | null>(null)
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const gridRef = useRef<HTMLElement>(null)
  const pendingFocus = useRef<{ selector: string; fallback?: string } | null>(null)
  const elements = useRef(new Map<string, SlotControls & { element: HTMLDivElement }>())
  const pointerY = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const autoScrollFrame = useRef(0)
  const isDragActive = useRef(false)

  const order = dragOrder ?? team.slots.map((_, index) => index)
  const displayed = order.map((index) => team.slots[index])
  const keys = slotRenderKeys(displayed)
  const layoutKey = keys.join()
  const filledCount = team.slots.filter((slot) => slot.pokemon).length

  useEffect(() => {
    useTeamHighlightStore.getState().clear()
  }, [])

  // Focus restoration after a change that moved or removed the focused control.
  useEffect(() => {
    const target = pendingFocus.current
    if (!target) {
      return
    }
    pendingFocus.current = null
    const grid = gridRef.current
    const first = grid?.querySelector<HTMLButtonElement>(target.selector)
    const usable = first && !first.disabled ? first : null
    ;(usable ?? (target.fallback ? grid?.querySelector<HTMLElement>(target.fallback) : null))?.focus()
  }, [team.slots])

  const registerElement = useCallback(
    (slotKey: string, element: HTMLDivElement | null, controls: SlotControls) => {
      if (element) {
        elements.current.set(slotKey, { element, ...controls })
      } else {
        elements.current.delete(slotKey)
      }
    },
    [],
  )

  const stopAutoScroll = useCallback(() => {
    cancelAnimationFrame(autoScrollFrame.current)
    autoScrollFrame.current = 0
    pointerY.current = null
    pointerStartY.current = null
  }, [])

  const endDrag = useCallback(() => {
    isDragActive.current = false
    stopAutoScroll()
    setDragOrder(null)
    setDraggingKey(null)
  }, [stopAutoScroll])

  useEffect(() => stopAutoScroll, [stopAutoScroll])

  useEffect(() => {
    if (!draggingKey) {
      return
    }
    // Esc during a drag puts everything back where it was: the card lets go of the pointer
    // and snaps back (dragSnapToOrigin), and the drop is ignored.
    const key = draggingKey
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        isDragActive.current = false
        elements.current.get(key)?.stopDrag()
        endDrag()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [draggingKey, endDrag])

  function announceMove(slot: TeamSlot | undefined, toIndex: number) {
    if (slot?.pokemon) {
      setAnnouncement(`${slot.pokemon.displayName} movido para a posição ${toIndex + 1} de ${team.slots.length}.`)
    }
  }

  function moveWithButton(slotKey: string, direction: -1 | 1) {
    const from = keys.indexOf(slotKey)
    const to = from + direction
    if (from < 0 || to < 0 || to >= team.slots.length) {
      return
    }
    // React moves the card's DOM node, which drops focus: put it back on the same button
    // (or the other one, if this one is now disabled at the edge).
    const which = direction < 0 ? 'back' : 'forward'
    const other = direction < 0 ? 'forward' : 'back'
    pendingFocus.current = {
      selector: `[data-slot-key="${slotKey}"] [data-move="${which}"]`,
      fallback: `[data-slot-key="${slotKey}"] [data-move="${other}"]`,
    }
    announceMove(team.slots[from], to)
    onMoveSlot(from, to)
  }

  // Keyboard/single-pointer alternative to dragging (WCAG 2.5.7), shown in Organizar mode.
  function moveButtons(slot: TeamSlot, slotKey: string, displayIndex: number, dragHandle: ReactNode) {
    const name = slot.pokemon?.displayName ?? ''
    const buttonClass =
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-azure/30 bg-azure/8 text-azure-100 transition-colors hover:bg-azure/15 disabled:cursor-not-allowed disabled:opacity-40'
    return (
      <div className="col-[1/-1] grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)] gap-2">
        {dragHandle}
        <button
          aria-label={`Mover ${name} para a posição ${displayIndex}`}
          className={buttonClass}
          data-move="back"
          disabled={displayIndex === 0}
          onClick={() => moveWithButton(slotKey, -1)}
          type="button"
        >
          <ArrowLeft size={15} />
          Antes
        </button>
        <button
          aria-label={`Mover ${name} para a posição ${displayIndex + 2}`}
          className={buttonClass}
          data-move="forward"
          disabled={displayIndex === team.slots.length - 1}
          onClick={() => moveWithButton(slotKey, 1)}
          type="button"
        >
          Depois
          <ArrowRight size={15} />
        </button>
      </div>
    )
  }

  function autoScroll(slotKey: string) {
    const clientY = pointerY.current
    const startY = pointerStartY.current
    if (clientY !== null && startY !== null) {
      const header = document.querySelector('header')
      const headerBottom =
        header && getComputedStyle(header).position === 'sticky' ? Math.max(header.getBoundingClientRect().bottom, 0) : 0
      const step =
        clientY < headerBottom + AUTO_SCROLL_EDGE && clientY < startY - AUTO_SCROLL_INTENT
          ? -AUTO_SCROLL_STEP
          : clientY > innerHeight - AUTO_SCROLL_EDGE && clientY > startY + AUTO_SCROLL_INTENT
            ? AUTO_SCROLL_STEP
            : 0
      if (step !== 0) {
        const before = scrollY
        scrollBy(0, step)
        // The card moves with the page; shift it back so it stays under the finger.
        elements.current.get(slotKey)?.shiftY(scrollY - before)
      }
    }
    autoScrollFrame.current = requestAnimationFrame(() => autoScroll(slotKey))
  }

  const dragHandlers: DragHandlers = {
    onDragStart: (slotKey) => {
      isDragActive.current = true
      setDragOrder(order)
      setDraggingKey(slotKey)
      cancelAnimationFrame(autoScrollFrame.current)
      autoScrollFrame.current = requestAnimationFrame(() => autoScroll(slotKey))
    },
    onDrag: (slotKey, info) => {
      if (!isDragActive.current) {
        return
      }
      const clientX = info.point.x - scrollX
      const clientY = info.point.y - scrollY
      pointerY.current = clientY
      pointerStartY.current ??= clientY
      // Target = the slot under the finger. The dragged card's own box is skipped.
      const from = keys.indexOf(slotKey)
      const to = keys.findIndex((key) => {
        if (key === slotKey) {
          return false
        }
        const box = elements.current.get(key)?.element.getBoundingClientRect()
        return box ? clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom : false
      })
      if (from >= 0 && to >= 0 && to !== from) {
        const next = [...order]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        setDragOrder(next)
      }
    },
    onDragEnd: (slotKey) => {
      const wasActive = isDragActive.current
      const finalOrder = order
      endDrag()
      if (!wasActive) {
        return // cancelled with Esc
      }
      const to = keys.indexOf(slotKey)
      const from = finalOrder[to]
      if (from !== undefined && from !== to) {
        announceMove(team.slots[from], to)
        onMoveSlot(from, to)
      }
    },
  }

  return (
    <div className="grid gap-2.5">
      {filledCount >= 2 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-[0.82rem] text-muted">
            {isOrganizing ? 'Arraste pela alça ou use Antes/Depois.' : 'A ordem define quem entra primeiro.'}
          </p>
          <button
            aria-pressed={isOrganizing}
            className={
              isOrganizing
                ? 'inline-flex min-h-11 items-center gap-2 rounded-full border border-gilt/40 bg-gilt/12 px-4 font-semibold text-gold'
                : 'inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4'
            }
            onClick={() => setIsOrganizing((value) => !value)}
            type="button"
          >
            {isOrganizing ? <Check size={16} /> : <ArrowDownUp size={16} />}
            {isOrganizing ? 'Concluir' : 'Organizar'}
          </button>
        </div>
      )}
      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>
      <m.section
        animate="visible"
        aria-label="Slots do time"
        // relative: popLayout takes a leaving card out of the flow, positioned against this.
        className="relative grid gap-2.5 md:grid-cols-2 lg:grid-cols-3"
        initial={shouldStagger ? 'hidden' : false}
        key={team.id}
        onAnimationComplete={() => onStaggered(team.id)}
        ref={gridRef}
        variants={{ visible: { transition: { staggerChildren: shouldStagger ? stagger : 0 } } }}
      >
        <AnimatePresence custom={isClearing} mode="popLayout">
          {displayed.map((slot, displayIndex) => {
            const slotKey = keys[displayIndex]
            const storeIndex = order[displayIndex]
            const glow =
              recentlyAdded?.teamId === team.id && recentlyAdded.slotIndex === storeIndex && slot.pokemon !== null
            return (
              <SlotItem
                {...dragHandlers}
                renderCard={(dragHandle) => (
                  <TeamSlotCard
                    actions={
                      isOrganizing && slot.pokemon ? moveButtons(slot, slotKey, displayIndex, dragHandle) : undefined
                    }
                    isSelected={storeIndex === selectedSlotIndex}
                    onEdit={onEdit}
                    onRemove={(slotIndex) => {
                      pendingFocus.current = { selector: `[data-slot-id="${team.slots[slotIndex].id}"]` }
                      onRemove(slotIndex)
                    }}
                    slot={slot}
                    slotIndex={storeIndex}
                  />
                )}
                displayIndex={displayIndex}
                glow={glow}
                isClearing={isClearing}
                isDragging={draggingKey === slotKey}
                isOrganizing={isOrganizing}
                key={slotKey}
                layoutKey={layoutKey}
                onGlowDone={() => setRecentlyAdded(null)}
                registerElement={registerElement}
                shouldStagger={shouldStagger}
                slot={slot}
                slotKey={slotKey}
              />
            )
          })}
        </AnimatePresence>
      </m.section>
    </div>
  )
}
