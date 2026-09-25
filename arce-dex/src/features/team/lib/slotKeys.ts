import type { TeamSlot } from '@/shared/types/team'

/**
 * React keys for the slot grid, by *who* is in the slot rather than *where*: slot ids are
 * positional (`team-1-slot-3`, which is also how sync stores them), so keying by them would
 * make "Garchomp moved from 1 to 3" look like "slots 1 and 3 changed content" and Motion
 * could neither slide the card nor play its exit. The same Pokémon may appear twice, hence
 * the occurrence counter. Empty slots keep their positional id.
 */
export function slotRenderKeys(slots: TeamSlot[]): string[] {
  const seen = new Map<number, number>()
  return slots.map((slot) => {
    if (!slot.pokemon) {
      return slot.id
    }
    const occurrence = seen.get(slot.pokemon.id) ?? 0
    seen.set(slot.pokemon.id, occurrence + 1)
    return `pokemon-${slot.pokemon.id}-${occurrence}`
  })
}
