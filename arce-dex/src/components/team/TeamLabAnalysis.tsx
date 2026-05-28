import { AlertTriangle, Gauge, Shield, Swords, Users } from 'lucide-react'
import {
  ALL_POKEMON_TYPES,
  calculateTeamOffensiveProfile,
  calculateTeamDefensiveAnalysis,
} from '../../lib/type-chart'
import { calculateFinalStats } from '../../lib/stats'
import type { MoveDetail } from '../../types/pokemon'
import type { Team, TeamPokemon } from '../../types/team'
import { TypeBadges } from '../pokemon/TypeBadges'

type TeamLabAnalysisProps = {
  team: Team
  moveDetails?: Record<string, MoveDetail>
}

export function TeamLabAnalysis({ moveDetails = {}, team }: TeamLabAnalysisProps) {
  const pokemons = team.slots.flatMap((slot) => (slot.pokemon ? [slot.pokemon] : []))
  const defensiveSummary = calculateTeamDefensiveAnalysis(team)
  const commonWeaknesses = defensiveSummary
    .filter((summary) => summary.weakTo >= 2)
    .sort((left, right) => right.weakTo - left.weakTo)
  const resistances = defensiveSummary
    .filter((summary) => summary.resists > 0)
    .map((summary) => summary.type)
  const immunities = defensiveSummary
    .filter((summary) => summary.immune > 0)
    .map((summary) => summary.type)
  const offensiveProfile = calculateTeamOffensiveProfile(pokemons, moveDetails)
  const coverage = offensiveProfile.coverage
  const speedRows = getSpeedRows(pokemons)
  const roles = summarizeRoles(pokemons)
  const moves = pokemons.flatMap((pokemon) => pokemon.moves ?? [])
  const uniqueMoves = [...new Set(moves)]
  const knownMoveCategories = Object.values(offensiveProfile.categoryCounts).reduce(
    (total, count) => total + count,
    0,
  )
  const unknownMoveCount = Math.max(0, uniqueMoves.length - knownMoveCategories)
  const uncoveredTypes = ALL_POKEMON_TYPES.filter(
    (type) => !coverage.superEffectiveAgainst.includes(type),
  )
  const redundantTypes = getRepeatedTypes(pokemons)
  const alerts = getTeamAlerts(pokemons, commonWeaknesses)

  return (
    <section className="team-lab-analysis">
      <article>
        <Shield size={18} />
        <h3>Defesa</h3>
        <p>Fraquezas comuns</p>
        {commonWeaknesses.length > 0 ? (
          commonWeaknesses.map((summary) => (
            <div className="risk-row" key={summary.type}>
              <TypeBadges compact types={[summary.type]} />
              <span>{summary.weakTo} fracos</span>
            </div>
          ))
        ) : (
          <p className="empty-copy">Sem fraqueza compartilhada relevante.</p>
        )}
        <p>Resistencias</p>
        <TypeBadges compact types={resistances} />
        <p>Imunidades</p>
        <TypeBadges compact types={immunities} />
      </article>

      <article>
        <Swords size={18} />
        <h3>Ofensiva</h3>
        <p>{uniqueMoves.length}/24 golpes cadastrados.</p>
        <p>
          {offensiveProfile.usedFallbackTypes
            ? 'Cobertura estimada pelos tipos dos Pokemon.'
            : 'Cobertura calculada pelos tipos dos golpes escolhidos.'}
        </p>
        <p>Tipos ofensivos</p>
        <TypeBadges compact types={offensiveProfile.attackingTypes} />
        <p>Divisao dos golpes</p>
        <div className="move-category-grid">
          <span>Physical <strong>{offensiveProfile.categoryCounts.physical}</strong></span>
          <span>Special <strong>{offensiveProfile.categoryCounts.special}</strong></span>
          <span>Status <strong>{offensiveProfile.categoryCounts.status}</strong></span>
          <span>Desconhecido <strong>{unknownMoveCount}</strong></span>
        </div>
        <div className="coverage-grid">
          {coverage.superEffectiveAgainst.map((type) => (
            <span className="is-covered" key={type}>
              {type}
            </span>
          ))}
        </div>
        <p>Pouco cobertos</p>
        <TypeBadges compact types={uncoveredTypes} />
        {offensiveProfile.pokemonWithoutMoves > 0 ? (
          <p className="empty-copy">
            {offensiveProfile.pokemonWithoutMoves} Pokemon sem golpes cadastrados.
          </p>
        ) : null}
      </article>

      <article>
        <Gauge size={18} />
        <h3>Velocidade</h3>
        {speedRows.length > 0 ? (
          <>
            <p>Media: {Math.round(average(speedRows.map((row) => row.speed)))}</p>
            <p>
              Mais rapido: {speedRows[0].name} ({speedRows[0].speed})
            </p>
            <p>
              Mais lento: {speedRows.at(-1)?.name} ({speedRows.at(-1)?.speed})
            </p>
            <div className="speed-rank">
              {speedRows.map((row) => (
                <span key={row.name}>
                  {row.name} <strong>{row.speed}</strong>
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="empty-copy">Base stats ainda nao carregados.</p>
        )}
      </article>

      <article>
        <Users size={18} />
        <h3>Estrutura</h3>
        <p>Fisicos: {roles.physical}</p>
        <p>Especiais: {roles.special}</p>
        <p>Tanks/Suportes: {roles.utility}</p>
        {redundantTypes.length > 0 ? (
          <>
            <p>Tipos repetidos</p>
            <TypeBadges compact types={redundantTypes} />
          </>
        ) : null}
      </article>

      <article>
        <AlertTriangle size={18} />
        <h3>Alertas</h3>
        {alerts.length > 0 ? (
          alerts.map((alert) => <p key={alert}>{alert}</p>)
        ) : (
          <p className="empty-copy">Nenhum alerta critico.</p>
        )}
      </article>
    </section>
  )
}

function getSpeedRows(pokemons: TeamPokemon[]) {
  return pokemons
    .flatMap((pokemon) => {
      if (!pokemon.baseStats) {
        return []
      }

      return [
        {
          name: pokemon.displayName,
          speed: calculateFinalStats(pokemon.baseStats, pokemon).speed.final,
        },
      ]
    })
    .sort((left, right) => right.speed - left.speed)
}

function summarizeRoles(pokemons: TeamPokemon[]) {
  return pokemons.reduce(
    (summary, pokemon) => {
      if (pokemon.role === 'physical-sweeper' || pokemon.role === 'wallbreaker') {
        return { ...summary, physical: summary.physical + 1 }
      }

      if (pokemon.role === 'special-sweeper') {
        return { ...summary, special: summary.special + 1 }
      }

      if (
        pokemon.role === 'physical-tank' ||
        pokemon.role === 'special-tank' ||
        pokemon.role === 'support' ||
        pokemon.role === 'hazard-setter' ||
        pokemon.role === 'hazard-remover'
      ) {
        return { ...summary, utility: summary.utility + 1 }
      }

      return summary
    },
    { physical: 0, special: 0, utility: 0 },
  )
}

function getTeamAlerts(
  pokemons: TeamPokemon[],
  commonWeaknesses: ReturnType<typeof calculateTeamDefensiveAnalysis>,
) {
  const alerts: string[] = []
  const itemCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()

  pokemons.forEach((pokemon) => {
    if (pokemon.item) {
      itemCounts.set(pokemon.item, (itemCounts.get(pokemon.item) ?? 0) + 1)
    }

    pokemon.types.forEach((type) => {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
    })
  })

  commonWeaknesses
    .filter((summary) => summary.weakTo >= 3)
    .forEach((summary) => alerts.push(`${summary.weakTo} Pokemon fracos a ${summary.type}.`))

  itemCounts.forEach((count, item) => {
    if (count > 1) {
      alerts.push(`Item repetido: ${item}.`)
    }
  })

  typeCounts.forEach((count, type) => {
    if (count >= 3) {
      alerts.push(`Tipo ${type} aparece ${count} vezes.`)
    }
  })

  const withoutMoves = pokemons.filter((pokemon) => (pokemon.moves ?? []).length === 0)
  const withoutRole = pokemons.filter((pokemon) => !pokemon.role)

  if (withoutMoves.length > 0) {
    alerts.push(`${withoutMoves.length} Pokemon sem golpes cadastrados.`)
  }

  if (withoutRole.length > 0) {
    alerts.push(`${withoutRole.length} Pokemon sem funcao definida.`)
  }

  const roles = summarizeRoles(pokemons)

  if (roles.physical >= 4 && roles.special === 0) {
    alerts.push('Time muito fisico: considere um atacante especial.')
  }

  if (roles.special >= 4 && roles.physical === 0) {
    alerts.push('Time muito especial: considere um atacante fisico.')
  }

  if (pokemons.length >= 4 && roles.utility === 0) {
    alerts.push('Nenhum suporte/tank definido no time.')
  }

  return alerts
}

function getRepeatedTypes(pokemons: TeamPokemon[]) {
  const typeCounts = new Map<string, number>()

  pokemons.forEach((pokemon) => {
    pokemon.types.forEach((type) => {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
    })
  })

  return [...typeCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([type]) => type as TeamPokemon['types'][number])
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((total, value) => total + value, 0) / values.length
}
