import { useState } from 'react'
import type { PokemonForm, PokemonMove, PokemonTypeName } from '../../types/pokemon'
import { TypeBadges } from './TypeBadges'

export type PokemonTabData = {
  evolution: string[]
  moves: PokemonMove[]
  weaknesses: PokemonTypeName[]
  resistances: PokemonTypeName[]
  immunities: PokemonTypeName[]
  forms: PokemonForm[]
}

type PokemonTabsProps = {
  data: PokemonTabData
}

const tabs = ['Info', 'Evolucao', 'Golpes', 'Fraquezas', 'Formas'] as const

export function PokemonTabs({ data }: PokemonTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Info')

  return (
    <section className="tabs-card">
      <div className="tab-list" role="tablist" aria-label="Dados do Pokemon">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={activeTab === tab ? 'is-active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        {activeTab === 'Info' && (
          <StateBlock
            label="success"
            title="Resumo pronto"
            text="Dados principais separados da camada de API e prontos para receber hooks reais."
          />
        )}
        {activeTab === 'Evolucao' && (
          <div className="evolution-line">
            {data.evolution.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        )}
        {activeTab === 'Golpes' && (
          <div className="move-list">
            {data.moves.map((move) => (
              <div key={move.name}>
                <span>{move.displayName}</span>
                <strong>
                  {move.learnedAtLevel === null ? move.learnMethod : `Lv. ${move.learnedAtLevel}`}
                </strong>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Fraquezas' && (
          <div className="weakness-grid">
            <TypeGroup label="Fraquezas" types={data.weaknesses} />
            <TypeGroup label="Resiste" types={data.resistances} />
            <TypeGroup label="Imune" types={data.immunities} />
          </div>
        )}
        {activeTab === 'Formas' && (
          <div className="form-list">
            {data.forms.map((form) => (
              <span key={form.name}>{form.displayName}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TypeGroup({ label, types }: { label: string; types: PokemonTypeName[] }) {
  return (
    <section>
      <h3>{label}</h3>
      <TypeBadges types={types} />
    </section>
  )
}

function StateBlock({
  label,
  title,
  text,
}: {
  label: 'loading' | 'empty' | 'error' | 'success'
  title: string
  text: string
}) {
  return (
    <div className={`state-block state-block--${label}`}>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}
