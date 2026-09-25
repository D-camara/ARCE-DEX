import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, type Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { duration, ease, layoutTransition, stagger } from '@/shared/ui'
import type { Team } from '@/shared/types/team'
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

export function TeamSlotGrid({
  isClearing,
  onEdit,
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
  const gridRef = useRef<HTMLElement>(null)
  const pendingFocusSlotId = useRef<string | null>(null)
  const keys = slotRenderKeys(team.slots)

  useEffect(() => {
    useTeamHighlightStore.getState().clear()
  }, [])

  // After "Remover", focus the empty slot that took the card's place (the button is gone).
  useEffect(() => {
    const slotId = pendingFocusSlotId.current
    if (slotId === null) {
      return
    }
    pendingFocusSlotId.current = null
    gridRef.current?.querySelector<HTMLElement>(`[data-slot-id="${slotId}"]`)?.focus()
  }, [team.slots])

  return (
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
        {team.slots.map((slot, index) => {
          const isNew = recentlyAdded?.teamId === team.id && recentlyAdded.slotIndex === index && slot.pokemon !== null
          return (
            <m.div
              animate={shouldStagger ? 'visible' : 'fadeIn'}
              // grid: the card inside stretches to the row height, like it did as a direct grid item.
              className="relative grid"
              custom={isClearing}
              aria-label={slot.pokemon ? undefined : `Slot ${index + 1} vazio`}
              data-slot-id={slot.pokemon ? undefined : slot.id}
              exit="exit"
              initial={shouldStagger ? undefined : { opacity: 0 }}
              key={keys[index]}
              // position only: a neighbour whose height changes (row stretch) must not be scaled.
              layout="position"
              // Only who-is-where changes slide slots, not details (stats, moves) loading in.
              layoutDependency={keys.join()}
              role={slot.pokemon ? undefined : 'group'}
              tabIndex={slot.pokemon ? undefined : -1}
              transition={{ layout: layoutTransition }}
              variants={slotVariants(index)}
            >
              <TeamSlotCard
                isSelected={index === selectedSlotIndex}
                onEdit={onEdit}
                onRemove={(slotIndex) => {
                  pendingFocusSlotId.current = team.slots[slotIndex].id
                  onRemove(slotIndex)
                }}
                slot={slot}
                slotIndex={index}
              />
              {isNew && (
                <m.span
                  animate={{ opacity: [0, 1, 0] }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-gilt/70 shadow-glow-gold"
                  initial={{ opacity: 0 }}
                  onAnimationComplete={() => setRecentlyAdded(null)}
                  transition={{ delay: 0.3, duration: duration.flash, ease: ease.out, times: [0, 0.3, 1] }}
                />
              )}
            </m.div>
          )
        })}
      </AnimatePresence>
    </m.section>
  )
}
