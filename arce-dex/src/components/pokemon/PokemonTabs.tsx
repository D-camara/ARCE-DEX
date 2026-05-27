import { useState } from 'react'
import type {
  EvolutionChain,
  EvolutionNode,
  PokemonForm,
  PokemonMove,
  PokemonTypeName,
  TypeEffectiveness,
} from '../../types/pokemon'

export type PokemonTabData = {
  currentPokemonName: string
  evolutionChain: EvolutionChain | undefined
  moves: PokemonMove[]
  weaknesses: PokemonTypeName[]
  resistances: PokemonTypeName[]
  immunities: PokemonTypeName[]
  effectiveness: TypeEffectiveness[]
  forms: PokemonForm[]
}

type PokemonTabsProps = {
  data: PokemonTabData
  activeTab?: PokemonTabName
  onTabChange?: (tab: PokemonTabName) => void
}

const tabs = ['Info', 'Evolucao', 'Golpes', 'Fraquezas', 'Formas'] as const
export type PokemonTabName = (typeof tabs)[number]

export function PokemonTabs({ activeTab, data, onTabChange }: PokemonTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<PokemonTabName>('Info')
  const selectedTab = activeTab ?? internalActiveTab

  function handleTabChange(tab: PokemonTabName) {
    setInternalActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <section className="tabs-card">
      <div className="tab-list" role="tablist" aria-label="Dados do Pokemon">
        {tabs.map((tab) => (
          <button
            aria-selected={selectedTab === tab}
            className={selectedTab === tab ? 'is-active' : ''}
            key={tab}
            onClick={() => handleTabChange(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        {selectedTab === 'Info' && (
          <StateBlock
            label="success"
            title="Resumo individual"
            text="Tipos, habilidades, status e dados defensivos deste Pokemon."
          />
        )}
        {selectedTab === 'Evolucao' && (
          <EvolutionTree
            currentPokemonName={data.currentPokemonName}
            root={data.evolutionChain?.root}
          />
        )}
        {selectedTab === 'Golpes' && (
          <div className="move-list">
            {data.moves.length > 0 ? (
              data.moves.map((move) => (
                <div key={`${move.name}-${move.learnMethod}-${move.learnedAtLevel}`}>
                  <span>{move.displayName}</span>
                  <strong>{formatMoveLearnMethod(move)}</strong>
                </div>
              ))
            ) : (
              <p className="empty-copy">Nenhum golpe carregado.</p>
            )}
          </div>
        )}
        {selectedTab === 'Fraquezas' && (
          <div className="weakness-grid">
            <EffectivenessGroup
              items={data.effectiveness.filter((item) => item.multiplier > 1)}
              label="Fraquezas"
            />
            <EffectivenessGroup
              items={data.effectiveness.filter(
                (item) => item.multiplier > 0 && item.multiplier < 1,
              )}
              label="Resistencias"
            />
            <EffectivenessGroup
              items={data.effectiveness.filter((item) => item.multiplier === 0)}
              label="Imunidades"
            />
          </div>
        )}
        {selectedTab === 'Formas' && (
          <div className="form-list">
            {data.forms.length > 0 ? (
              data.forms.map((form) => (
                <span className={form.isDefault ? 'is-current-form' : ''} key={form.name}>
                  {form.displayName}
                </span>
              ))
            ) : (
              <p className="empty-copy">Nenhuma forma alternativa carregada.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function EffectivenessGroup({ label, items }: { label: string; items: TypeEffectiveness[] }) {
  return (
    <section>
      <h3>{label}</h3>
      {items.length > 0 ? (
        <div className="effectiveness-badges">
          {items.map((item) => (
            <span className={`type-badge type-${item.type}`} key={item.type}>
              {item.type} {formatMultiplier(item.multiplier)}
            </span>
          ))}
        </div>
      ) : (
        <p className="empty-copy">Nenhum item neste grupo.</p>
      )}
    </section>
  )
}

function EvolutionTree({
  currentPokemonName,
  root,
}: {
  currentPokemonName: string
  root: EvolutionNode | undefined
}) {
  if (!root) {
    return <p className="empty-copy">Linha evolutiva nao carregada.</p>
  }

  return <EvolutionBranch currentPokemonName={currentPokemonName} node={root} />
}

function EvolutionBranch({
  currentPokemonName,
  node,
}: {
  currentPokemonName: string
  node: EvolutionNode
}) {
  const isCurrent = node.name === currentPokemonName

  return (
    <div className="evolution-branch">
      <button className={isCurrent ? 'evolution-node is-current' : 'evolution-node'} type="button">
        {node.sprite && <img src={node.sprite} alt="" />}
        <strong>{node.displayName}</strong>
        <small>{node.method}</small>
      </button>
      {node.evolvesTo.length > 0 && (
        <div className="evolution-children">
          {node.evolvesTo.map((child) => (
            <EvolutionBranch currentPokemonName={currentPokemonName} key={child.name} node={child} />
          ))}
        </div>
      )}
    </div>
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

function formatMultiplier(multiplier: number) {
  if (multiplier === 0.25) {
    return '1/4'
  }

  if (multiplier === 0.5) {
    return '1/2'
  }

  return `${multiplier}x`
}

function formatMoveLearnMethod(move: PokemonMove) {
  if (move.learnedAtLevel !== null && move.learnMethod === 'level-up') {
    return move.learnedAtLevel <= 1 ? 'Lv. 1' : `Lv. ${move.learnedAtLevel}`
  }

  if (move.learnMethod === 'machine') {
    return 'TM'
  }

  if (move.learnMethod === 'egg') {
    return 'Egg'
  }

  if (move.learnMethod === 'tutor') {
    return 'Tutor'
  }

  return move.learnMethod
}
