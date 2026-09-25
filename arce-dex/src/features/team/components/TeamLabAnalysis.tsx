import { AlertTriangle, Gauge, Shield, Swords, Users } from 'lucide-react'
import {
  ALL_POKEMON_TYPES,
  calculateTeamOffensiveProfile,
  calculateTeamDefensiveAnalysis,
} from '@/features/type-analysis'
import { calculateFinalStats } from '@/shared/lib/stats'
import type { MoveDetail } from '@/shared/types/pokemon'
import type { Team, TeamPokemon } from '@/shared/types/team'
import { TypeBadges } from '@/features/pokemon'

type TeamLabAnalysisProps = {
  team: Team
  moveDetails?: Record<string, MoveDetail>
}

const articleClass =
  'grid content-start gap-3 rounded-[20px] border border-parchment/12 bg-ink/70 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(246,237,211,0.02)]'
const headingClass =
  'mb-3.5 flex min-h-[24px] items-center border-b border-parchment/10 pb-2.5 pl-7 text-[1.05rem] font-extrabold uppercase tracking-wide text-[color:var(--color-gold-soft)]'
const iconClass = 'text-gold -mb-8 z-[2]'
const labelClass =
  'mt-3 mb-1 border-l-2 border-gold pl-2 text-[0.76rem] font-bold uppercase tracking-wide text-[color:var(--color-gold-soft)]'
const emptyClass =
  'mt-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[color:var(--color-silver,#c9c7bd)]'
const kpiRowClass =
  'my-1 flex items-center justify-between rounded-xl border border-parchment/6 bg-parchment/2 px-3 py-2 text-[0.84rem] text-[color:var(--color-silver,#c9c7bd)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'

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
    <section className="grid gap-4 md:grid-cols-2">
      <article className={articleClass}>
        <Shield size={18} className={iconClass} />
        <h3 className={headingClass}>Defesa</h3>
        <p className={labelClass}>Fraquezas comuns</p>
        {commonWeaknesses.length > 0 ? (
          commonWeaknesses.map((summary) => (
            <div
              className="mb-1 flex items-center justify-between gap-2.5 rounded-xl border border-parchment/8 bg-parchment/2 px-2.5 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
              key={summary.type}
            >
              <TypeBadges compact types={[summary.type]} />
              <span>{summary.weakTo} fracos</span>
            </div>
          ))
        ) : (
          <p className={emptyClass}>Sem fraqueza compartilhada relevante.</p>
        )}
        <p className={labelClass}>Resistencias</p>
        <TypeBadges compact types={resistances} />
        <p className={labelClass}>Imunidades</p>
        <TypeBadges compact types={immunities} />
      </article>

      <article className={articleClass}>
        <Swords size={18} className={iconClass} />
        <h3 className={headingClass}>Ofensiva</h3>
        <p className="mb-0.5 text-[0.95rem] font-semibold text-ivory">
          {uniqueMoves.length}/24 golpes cadastrados.
        </p>
        <p className="mb-3 rounded-r-md border-l-2 border-cosmic-blue bg-cosmic-blue/4 px-2.5 py-1.5 text-[0.8rem] leading-snug text-[color:var(--color-silver,#c9c7bd)] opacity-90">
          {offensiveProfile.usedFallbackTypes
            ? 'Cobertura estimada pelos tipos dos Pokémon.'
            : 'Cobertura calculada pelos tipos dos golpes escolhidos.'}
        </p>
        <p className={labelClass}>Tipos ofensivos</p>
        <TypeBadges compact types={offensiveProfile.attackingTypes} />
        <p className={labelClass}>Divisao dos golpes</p>
        <div className="grid grid-cols-2 gap-2">
          <span className="flex items-center justify-between gap-2 rounded-xl border border-line bg-panel/60 px-2.5 py-2 text-[0.78rem] text-muted shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            Physical <strong className="text-ivory">{offensiveProfile.categoryCounts.physical}</strong>
          </span>
          <span className="flex items-center justify-between gap-2 rounded-xl border border-line bg-panel/60 px-2.5 py-2 text-[0.78rem] text-muted shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            Special <strong className="text-ivory">{offensiveProfile.categoryCounts.special}</strong>
          </span>
          <span className="flex items-center justify-between gap-2 rounded-xl border border-line bg-panel/60 px-2.5 py-2 text-[0.78rem] text-muted shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            Status <strong className="text-ivory">{offensiveProfile.categoryCounts.status}</strong>
          </span>
          <span className="flex items-center justify-between gap-2 rounded-xl border border-line bg-panel/60 px-2.5 py-2 text-[0.78rem] text-muted shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            Desconhecido <strong className="text-ivory">{unknownMoveCount}</strong>
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(108px,1fr))] gap-2">
          {coverage.superEffectiveAgainst.map((type) => (
            <span
              key={type}
              className="rounded-xl border border-success-400/30 bg-success-400/8 p-2 text-success-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            >
              {type}
            </span>
          ))}
        </div>
        <p className={labelClass}>Pouco cobertos</p>
        <TypeBadges compact types={uncoveredTypes} />
        {offensiveProfile.pokemonWithoutMoves > 0 ? (
          <p className={emptyClass}>{offensiveProfile.pokemonWithoutMoves} Pokemon sem golpes cadastrados.</p>
        ) : null}
      </article>

      <article className={articleClass}>
        <Gauge size={18} className={iconClass} />
        <h3 className={headingClass}>Velocidade</h3>
        {speedRows.length > 0 ? (
          <>
            <p className={kpiRowClass}>Media: {Math.round(average(speedRows.map((row) => row.speed)))}</p>
            <p className={kpiRowClass}>
              Mais rapido: {speedRows[0].name} ({speedRows[0].speed})
            </p>
            <p className={kpiRowClass}>
              Mais lento: {speedRows.at(-1)?.name} ({speedRows.at(-1)?.speed})
            </p>
            <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(115px,1fr))] gap-2">
              {speedRows.map((row) => (
                <span
                  key={row.name}
                  className="flex items-center justify-between rounded-xl border border-parchment/8 bg-parchment/2 px-3 py-2 text-[0.82rem] text-[color:var(--color-silver,#c9c7bd)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
                >
                  {row.name} <strong className="font-mono text-[0.9rem] text-gold">{row.speed}</strong>
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className={emptyClass}>Base stats ainda não carregados.</p>
        )}
      </article>

      <article className={articleClass}>
        <Users size={18} className={iconClass} />
        <h3 className={headingClass}>Estrutura</h3>
        <p className={kpiRowClass}>Fisicos: {roles.physical}</p>
        <p className={kpiRowClass}>Especiais: {roles.special}</p>
        <p className={kpiRowClass}>Tanks/Suportes: {roles.utility}</p>
        {redundantTypes.length > 0 ? (
          <>
            <p className={labelClass}>Tipos repetidos</p>
            <TypeBadges compact types={redundantTypes} />
          </>
        ) : null}
      </article>

      <article
        className={`order-first md:col-span-2 ${articleClass} !border-gold/25 !bg-[linear-gradient(135deg,rgba(239,68,68,0.06),rgba(201,166,70,0.04)),rgba(9,11,16,0.85)] !shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(239,68,68,0.03)]`}
      >
        <AlertTriangle size={18} className={iconClass} />
        <h3 className={headingClass}>Alertas</h3>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <p
              key={alert}
              className="mb-2 flex items-center gap-2 rounded-lg border border-danger-500/15 border-l-4 border-l-danger-500 bg-danger-500/3 px-3.5 py-2.5 text-[0.88rem] font-medium text-ivory shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              {alert}
            </p>
          ))
        ) : (
          <p className="justify-center rounded-lg border border-success-400/15 border-l-4 border-l-success-400 bg-success-400/3 px-3.5 py-2.5 text-center text-[0.88rem] font-semibold text-success-400">
            Nenhum alerta critico.
          </p>
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
    .forEach((summary) => alerts.push(`${summary.weakTo} Pokémon fracos a ${summary.type}.`))

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
    alerts.push(`${withoutMoves.length} Pokémon sem golpes cadastrados.`)
  }

  if (withoutRole.length > 0) {
    alerts.push(`${withoutRole.length} Pokémon sem função definida.`)
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
