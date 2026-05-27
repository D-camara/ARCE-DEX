import { AlertTriangle, Shield, Swords } from 'lucide-react'
import type { OffensiveCoverage, TeamDefensiveTypeSummary } from '../../lib/type-chart'
import type { PokemonTypeName } from '../../types/pokemon'
import { TypeBadges } from '../pokemon/TypeBadges'

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
    <section className="analysis-panel">
      <header>
        <p className="eyebrow">Analise do time</p>
        <h2>Cobertura rapida</h2>
      </header>
      <div className="analysis-grid">
        <article>
          <AlertTriangle size={18} />
          <h3>Riscos</h3>
          {analysis.defensiveRisks.map((risk) => (
            <div className="risk-row" key={risk.type}>
              <TypeBadges compact types={[risk.type]} />
              <span>{risk.weakTo} fracos</span>
            </div>
          ))}
        </article>
        <article>
          <Shield size={18} />
          <h3>Defesa</h3>
          <TypeBadges types={analysis.resistances} />
          <p>Imunidades</p>
          <TypeBadges compact types={analysis.immunities} />
        </article>
        <article>
          <Swords size={18} />
          <h3>Cobertura</h3>
          <div className="coverage-grid">
            {analysis.coverage.superEffectiveAgainst.map((type) => (
              <span className="is-covered" key={type}>
                {type}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
