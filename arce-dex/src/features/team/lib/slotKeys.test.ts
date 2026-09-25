import { describe, expect, it } from 'vitest'
import type { TeamPokemon, TeamSlot } from '@/shared/types/team'
import { slotRenderKeys } from './slotKeys'

const pokemon = (id: number) => ({ id, name: `p${id}`, displayName: `P${id}`, sprite: '', types: [] }) as TeamPokemon
const slot = (index: number, member: TeamPokemon | null): TeamSlot => ({ id: `team-1-slot-${index + 1}`, pokemon: member })

describe('slotRenderKeys', () => {
  it('keys filled slots by Pokémon and empty ones by position', () => {
    expect(slotRenderKeys([slot(0, pokemon(445)), slot(1, null)])).toEqual(['pokemon-445-0', 'team-1-slot-2'])
  })

  it('keeps a Pokémon key stable when it changes position', () => {
    const before = slotRenderKeys([slot(0, pokemon(445)), slot(1, pokemon(448))])
    const after = slotRenderKeys([slot(0, pokemon(448)), slot(1, pokemon(445))])
    expect(after).toEqual([before[1], before[0]])
  })

  it('gives duplicates distinct keys', () => {
    const keys = slotRenderKeys([slot(0, pokemon(25)), slot(1, pokemon(25))])
    expect(new Set(keys).size).toBe(2)
  })
})
