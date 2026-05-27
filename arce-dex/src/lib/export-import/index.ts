import type { CompactTeamExport, Team, TeamSlot } from '../../types/team'

const MAX_TEAM_SIZE = 6

export type TeamImportResult =
  | {
      ok: true
      team: CompactTeamExport
    }
  | {
      ok: false
      error: string
    }

function compactPokemonIdentifier(slot: TeamSlot): string | number | null {
  if (!slot.pokemon) {
    return null
  }

  return slot.pokemon.name || slot.pokemon.id
}

export function exportJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export function importJson<T>(value: string): T {
  return JSON.parse(value) as T
}

export function exportTeam(team: Team): string {
  const compactTeam: CompactTeamExport = {
    name: team.name,
    pokemons: team.slots.map(compactPokemonIdentifier).filter((pokemon) => pokemon !== null),
  }

  return JSON.stringify(compactTeam, null, 2)
}

export function validateCompactTeamExport(value: unknown): TeamImportResult {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: 'O JSON precisa ser um objeto.' }
  }

  const maybeTeam = value as Partial<CompactTeamExport>

  if (typeof maybeTeam.name !== 'string' || !maybeTeam.name.trim()) {
    return { ok: false, error: 'O time precisa ter um nome.' }
  }

  if (!Array.isArray(maybeTeam.pokemons)) {
    return { ok: false, error: 'O time precisa ter uma lista de Pokemon.' }
  }

  if (maybeTeam.pokemons.length > MAX_TEAM_SIZE) {
    return { ok: false, error: 'O time pode ter no maximo 6 Pokemon.' }
  }

  const hasInvalidPokemon = maybeTeam.pokemons.some(
    (pokemon) =>
      !(
        (typeof pokemon === 'string' && pokemon.trim().length > 0) ||
        (typeof pokemon === 'number' && Number.isInteger(pokemon) && pokemon > 0)
      ),
  )

  if (hasInvalidPokemon) {
    return { ok: false, error: 'A lista de Pokemon contem valores invalidos.' }
  }

  return {
    ok: true,
    team: {
      name: maybeTeam.name.trim(),
      pokemons: maybeTeam.pokemons,
    },
  }
}

export function importTeamJson(value: string): TeamImportResult {
  try {
    return validateCompactTeamExport(JSON.parse(value) as unknown)
  } catch {
    return { ok: false, error: 'JSON invalido.' }
  }
}
