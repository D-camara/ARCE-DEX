import { describe, expect, it } from 'vitest'
import { exportTeam, importTeamJson, validateCompactTeamExport } from '.'
import type { Team } from '../../types/team'

describe('export-import', () => {
  it('exports a compact team JSON', () => {
    const team: Team = {
      id: 'team-1',
      name: 'Meu time principal',
      slots: [
        {
          id: 'slot-1',
          pokemon: {
            id: 260,
            name: 'swampert',
            displayName: 'Swampert',
            sprite: '',
            types: ['water', 'ground'],
          },
        },
        { id: 'slot-2', pokemon: null },
      ],
    }

    expect(JSON.parse(exportTeam(team))).toEqual({
      name: 'Meu time principal',
      pokemons: ['swampert'],
    })
  })

  it('imports valid compact JSON', () => {
    const result = importTeamJson(
      JSON.stringify({
        name: 'Meu time principal',
        pokemons: ['swampert', 'arcanine', 'kommo-o'],
      }),
    )

    expect(result).toEqual({
      ok: true,
      team: {
        name: 'Meu time principal',
        pokemons: ['swampert', 'arcanine', 'kommo-o'],
      },
    })
  })

  it('rejects invalid JSON', () => {
    expect(importTeamJson('{invalid')).toEqual({
      ok: false,
      error: 'JSON invalido.',
    })
  })

  it('rejects teams above 6 Pokemon', () => {
    const result = validateCompactTeamExport({
      name: 'Time cheio',
      pokemons: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    })

    expect(result).toEqual({
      ok: false,
      error: 'O time pode ter no maximo 6 Pokemon.',
    })
  })
})
