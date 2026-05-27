import { AlertTriangle, Shield, Swords } from 'lucide-react'
import type { TeamAnalysisMock } from '../../features/mockPokemonData'
import { TypeBadges } from '../pokemon/TypeBadges'

type TeamAnalysisPanelProps = {
  analysis: TeamAnalysisMock
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
              <span>{risk.score}</span>
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
            {analysis.coverage.map((item) => (
              <span className={item.covered ? 'is-covered' : ''} key={item.type}>
                {item.type}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
