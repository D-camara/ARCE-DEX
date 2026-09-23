import { AlertTriangle, Shield, Swords } from 'lucide-react'
import type { OffensiveCoverage, TeamDefensiveTypeSummary } from '../lib/type-chart'
import type { PokemonTypeName } from '@/shared/types/pokemon'
import { TypeBadges } from '@/features/pokemon'

export type TeamAnalysisPanelProps = {
  analysis: {
    defensiveRisks: TeamDefensiveTypeSummary[]
    resistances: PokemonTypeName[]
    immunities: PokemonTypeName[]
    coverage: OffensiveCoverage
  }
}

export function TeamAnalysisPanel({ analysis }: TeamAnalysisPanelProps) {
  return (
    <section className="rounded-2xl border border-line bg-panel/70 p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <header>
        <p className="text-gold">Analise do time</p>
        <h2>Cobertura rapida</h2>
      </header>
      <div className="grid gap-2.5">
        <article className="relative grid gap-2.5 overflow-hidden rounded-2xl border border-line bg-panel/50 p-3.5 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)]">
          <AlertTriangle size={18} />
          <h3>Riscos</h3>
          {analysis.defensiveRisks.map((risk) => (
            <div
              className="flex min-w-0 items-center justify-between gap-2.5 rounded-xl bg-panel/40 px-2.5 py-2"
              key={risk.type}
            >
              <TypeBadges compact types={[risk.type]} />
              <span>{risk.weakTo} fracos</span>
            </div>
          ))}
        </article>
        <article className="relative grid gap-2.5 overflow-hidden rounded-2xl border border-line bg-panel/50 p-3.5 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)]">
          <Shield size={18} />
          <h3>Defesa</h3>
          <TypeBadges types={analysis.resistances} />
          <p>Imunidades</p>
          <TypeBadges compact types={analysis.immunities} />
        </article>
        <article className="relative grid gap-2.5 overflow-hidden rounded-2xl border border-line bg-panel/50 p-3.5 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)]">
          <Swords size={18} />
          <h3>Cobertura</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(108px,1fr))] gap-2">
            {analysis.coverage.superEffectiveAgainst.map((type) => (
              <span
                key={type}
                className="rounded-xl border border-success-400/30 bg-success-400/8 p-2 text-success-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              >
                {type}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
