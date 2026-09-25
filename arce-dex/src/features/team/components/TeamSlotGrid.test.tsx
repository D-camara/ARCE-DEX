import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Team, TeamPokemon } from '@/shared/types/team'
import { TeamSlotGrid } from './TeamSlotGrid'

const member = (id: number, displayName: string) =>
  ({ id, name: displayName.toLowerCase(), displayName, sprite: '', types: ['dragon'] }) as TeamPokemon

function makeTeam(members: Array<TeamPokemon | null>): Team {
  return {
    id: 'team-1',
    name: 'Meu time',
    slots: Array.from({ length: 6 }, (_, index) => ({ id: `team-1-slot-${index + 1}`, pokemon: members[index] ?? null })),
  } as Team
}

function Harness() {
  const [team, setTeam] = useState(makeTeam([member(445, 'Garchomp'), member(448, 'Lucario')]))
  return (
    <TeamSlotGrid
      isClearing={false}
      onEdit={() => {}}
      onMoveSlot={() => {}}
      onRemove={(slotIndex) =>
        setTeam((current) => ({
          ...current,
          slots: current.slots.map((slot, index) => (index === slotIndex ? { ...slot, pokemon: null } : slot)),
        }))
      }
      onStaggered={() => {}}
      selectedSlotIndex={0}
      staggeredTeamId="team-1"
      team={team}
    />
  )
}

describe('TeamSlotGrid', () => {
  it('replaces a removed Pokémon with an empty slot and moves focus there', async () => {
    render(<Harness />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Remover' })[0])

    await waitFor(() => expect(screen.queryByText('Garchomp')).not.toBeInTheDocument())
    expect(screen.getByText('Lucario')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Slot 1 vazio' })).toHaveFocus()
  })
})
