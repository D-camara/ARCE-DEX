import type { PokemonTypeName } from '@/shared/types/pokemon'
import type { TeamDefensiveTypeSummary } from '@/features/type-analysis'

// Lives in the team feature (not type-analysis) on purpose: only the lazy-loaded lab uses it,
// and going through the type-analysis barrel would pull it into the main bundle.

/** What the team analysis showed the last time the user looked at it. */
export type TeamAnalysisSnapshot = {
  weakTo: Partial<Record<PokemonTypeName, number>>
  immune: PokemonTypeName[]
  /** null while move details are still loading: coverage would be a guess, don't compare it. */
  covered: PokemonTypeName[] | null
}

export type TeamAnalysisDiff = {
  /** Change in how many team members are weak to each type (only non-zero entries). */
  weakToDelta: Partial<Record<PokemonTypeName, number>>
  newlyCovered: PokemonTypeName[]
  noLongerCovered: PokemonTypeName[]
  newlyImmune: PokemonTypeName[]
  /** Human-readable summary, also announced to screen readers. */
  messages: string[]
}

export function snapshotTeamAnalysis(
  defensive: TeamDefensiveTypeSummary[],
  covered: PokemonTypeName[] | null,
): TeamAnalysisSnapshot {
  return {
    weakTo: Object.fromEntries(defensive.filter((row) => row.weakTo > 0).map((row) => [row.type, row.weakTo])),
    immune: defensive.filter((row) => row.immune > 0).map((row) => row.type),
    covered,
  }
}

const label = (type: PokemonTypeName) => type.charAt(0).toUpperCase() + type.slice(1)

/**
 * What changed since the last visit, or null when there is nothing to compare with (first
 * visit) or nothing changed. Pure: the lab keeps the snapshots, this only compares them.
 */
export function diffTeamAnalysis(
  previous: TeamAnalysisSnapshot | null,
  current: TeamAnalysisSnapshot,
): TeamAnalysisDiff | null {
  if (!previous) {
    return null
  }

  const types = new Set([...Object.keys(previous.weakTo), ...Object.keys(current.weakTo)] as PokemonTypeName[])
  const weakToDelta: TeamAnalysisDiff['weakToDelta'] = {}
  const messages: string[] = []

  for (const type of types) {
    const before = previous.weakTo[type] ?? 0
    const after = current.weakTo[type] ?? 0
    if (before !== after) {
      weakToDelta[type] = after - before
      const direction = after > before ? 'subiu' : 'caiu'
      messages.push(`Fraqueza a ${label(type)} ${direction} para ${after}.`)
    }
  }

  const newlyImmune = current.immune.filter((type) => !previous.immune.includes(type))
  for (const type of newlyImmune) {
    messages.push(`Agora tem imunidade a ${label(type)}.`)
  }

  const canCompareCoverage = previous.covered !== null && current.covered !== null
  const newlyCovered = canCompareCoverage
    ? current.covered!.filter((type) => !previous.covered!.includes(type))
    : []
  const noLongerCovered = canCompareCoverage
    ? previous.covered!.filter((type) => !current.covered!.includes(type))
    : []
  if (newlyCovered.length > 0) {
    messages.push(`Agora cobre ${newlyCovered.map(label).join(', ')}.`)
  }
  if (noLongerCovered.length > 0) {
    messages.push(`Deixou de cobrir ${noLongerCovered.map(label).join(', ')}.`)
  }

  return messages.length > 0 ? { weakToDelta, newlyCovered, noLongerCovered, newlyImmune, messages } : null
}
