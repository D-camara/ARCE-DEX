import { useState } from 'react'
import type {
  EvolutionChain,
  EvolutionNode,
  PokemonForm,
  PokemonMove,
  PokemonTypeName,
  TypeEffectiveness,
} from '@/shared/types/pokemon'
import { TypeBadges } from './TypeBadges'
import { typeBadgeStyle } from '../lib/type-colors'

export type PokemonTabData = {
  currentPokemonName: string
  evolutionChain: EvolutionChain | undefined
  infoItems: Array<{
    label: string
    value: string
  }>
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
  onSelectPokemon?: (identifier: string | number) => void
}

const tabs = ['Info', 'Evolucao', 'Golpes', 'Fraquezas', 'Formas'] as const
export type PokemonTabName = (typeof tabs)[number]

const tabLabels: Record<PokemonTabName, string> = {
  Info: 'Info',
  Evolucao: 'Evolução',
  Golpes: 'Golpes',
  Fraquezas: 'Fraquezas',
  Formas: 'Formas',
}

const emptyCopyClass = 'text-center italic tracking-wide text-muted opacity-80'
const tabButtonBase =
  'min-h-[38px] whitespace-nowrap rounded-lg border border-transparent bg-transparent px-4 text-[0.88rem] font-bold uppercase tracking-wide text-ivory-soft transition-all hover:bg-white/[0.03] hover:text-ivory'
const tabButtonActive =
  'border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] text-gold shadow-glow-gold [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]'

export function PokemonTabs({ activeTab, data, onSelectPokemon, onTabChange }: PokemonTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<PokemonTabName>('Info')
  const selectedTab = activeTab ?? internalActiveTab

  function handleTabChange(tab: PokemonTabName) {
    setInternalActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <section className="-mt-4 rounded-b-3xl border border-[rgba(246,237,211,0.12)] border-t-[rgba(246,237,211,0.08)] bg-[rgba(9,11,16,0.7)] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_0_30px_rgba(246,237,211,0.02)]">
      <div
        className="mb-4 flex gap-2 overflow-x-auto border-b border-[rgba(246,237,211,0.06)] pb-3"
        role="tablist"
        aria-label="Dados do Pokemon"
      >
        {tabs.map((tab) => (
          <button
            aria-selected={selectedTab === tab}
            className={selectedTab === tab ? `${tabButtonBase} ${tabButtonActive}` : tabButtonBase}
            key={tab}
            onClick={() => handleTabChange(tab)}
            role="tab"
            type="button"
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
      <div className="px-0.5 pt-2.5">
        {selectedTab === 'Info' && <InfoPanel items={data.infoItems} />}
        {selectedTab === 'Evolucao' && (
          <EvolutionTree
            currentPokemonName={data.currentPokemonName}
            onSelectPokemon={onSelectPokemon}
            root={data.evolutionChain?.root}
          />
        )}
        {selectedTab === 'Golpes' && (
          <div className="grid gap-2.5 min-[600px]:grid-cols-2 min-[600px]:gap-3">
            {data.moves.length > 0 ? (
              data.moves.map((move) => <MoveCard key={move.name} move={move} />)
            ) : (
              <p className={emptyCopyClass}>Nenhum golpe carregado.</p>
            )}
          </div>
        )}
        {selectedTab === 'Fraquezas' && (
          <div className="grid gap-2.5">
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
          <div className="flex flex-wrap items-stretch gap-2.5">
            {data.forms.length > 0 ? (
              data.forms.map((form) => (
                <button
                  className={
                    form.name === data.currentPokemonName
                      ? 'grid w-full max-w-[280px] min-h-[84px] cursor-pointer grid-cols-[58px_1fr] items-center gap-2.5 rounded-2xl border border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.12)] p-2.5 text-left text-ivory shadow-glow-gold'
                      : 'grid w-full max-w-[280px] min-h-[84px] cursor-pointer grid-cols-[58px_1fr] items-center gap-2.5 rounded-2xl border border-line bg-white/[0.04] p-2.5 text-left text-ivory transition-colors hover:border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.08)]'
                  }
                  key={form.name}
                  onClick={() => onSelectPokemon?.(form.name)}
                  type="button"
                >
                  {form.sprite && <img src={form.sprite} alt="" className="h-[58px] w-[58px] object-contain" />}
                  <span className="grid min-w-0 gap-1">
                    <strong>{form.displayName}</strong>
                    {form.id !== null && (
                      <small className="text-[0.72rem] text-muted">
                        #{String(form.id).padStart(4, '0')}
                      </small>
                    )}
                    <em className="text-[0.72rem] not-italic text-muted">{form.category}</em>
                    {form.types && form.types.length > 0 && <TypeBadges compact types={form.types} />}
                  </span>
                </button>
              ))
            ) : (
              <p className={emptyCopyClass}>Nenhuma forma alternativa encontrada para este Pokemon.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function InfoPanel({ items }: { items: PokemonTabData['infoItems'] }) {
  if (items.length === 0) {
    return <p className={emptyCopyClass}>Dados extras nao carregados.</p>
  }

  return (
    <dl className="m-0 grid grid-cols-1 gap-2.5 min-[600px]:grid-cols-2 min-[600px]:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-1 rounded-2xl border border-line bg-surface-2 p-3.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]"
        >
          <dt className="text-[0.75rem] font-extrabold uppercase tracking-wide text-ivory opacity-80">
            {item.label}
          </dt>
          <dd className="m-0 text-[1.05rem] font-extrabold text-ivory">{item.value || 'Nao informado'}</dd>
        </div>
      ))}
    </dl>
  )
}

function EffectivenessGroup({ label, items }: { label: string; items: TypeEffectiveness[] }) {
  return (
    <section className="grid gap-2">
      <h3>{label}</h3>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-[7px]">
          {items.map((item) => (
            <span
              key={item.type}
              style={typeBadgeStyle(item.type)}
              className="inline-flex min-h-[28px] w-fit max-w-max items-center justify-center gap-1 whitespace-nowrap rounded-full border border-line bg-surface-2 px-[0.65rem] py-[0.35rem] text-[0.72rem] font-extrabold uppercase leading-none text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]"
            >
              {item.type} {formatMultiplier(item.multiplier)}
            </span>
          ))}
        </div>
      ) : (
        <p className={emptyCopyClass}>Nenhum item neste grupo.</p>
      )}
    </section>
  )
}

function EvolutionTree({
  currentPokemonName,
  onSelectPokemon,
  root,
}: {
  currentPokemonName: string
  onSelectPokemon?: (identifier: string | number) => void
  root: EvolutionNode | undefined
}) {
  if (!root) {
    return <p className={emptyCopyClass}>Linha evolutiva nao carregada.</p>
  }

  return (
    <EvolutionBranch
      currentPokemonName={currentPokemonName}
      node={root}
      onSelectPokemon={onSelectPokemon}
    />
  )
}

function EvolutionBranch({
  currentPokemonName,
  node,
  onSelectPokemon,
}: {
  currentPokemonName: string
  node: EvolutionNode
  onSelectPokemon?: (identifier: string | number) => void
}) {
  const isCurrent = node.name === currentPokemonName

  return (
    <div className="grid gap-2.5">
      <button
        className={
          isCurrent
            ? 'inline-grid w-[min(128px,100%)] min-h-[128px] cursor-pointer gap-1 rounded-2xl border border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.12)] p-2.5 text-center text-ivory shadow-glow-gold transition-all'
            : 'inline-grid w-[min(128px,100%)] min-h-[128px] cursor-pointer gap-1 rounded-2xl border border-line bg-white/[0.04] p-2.5 text-center text-ivory transition-all hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.08)] hover:shadow-glow-gold'
        }
        onClick={() => onSelectPokemon?.(node.name)}
        type="button"
      >
        {node.sprite && (
          <img src={node.sprite} alt="" className="h-[68px] w-[68px] justify-self-center object-contain" />
        )}
        <strong>{node.displayName}</strong>
        {node.id !== null && <small className="text-[0.72rem] text-muted">#{String(node.id).padStart(4, '0')}</small>}
        <small className="text-[0.72rem] text-muted">{node.method}</small>
      </button>
      {node.evolvesTo.length > 0 && (
        <div className="flex flex-wrap gap-2.5 border-l border-line pl-3.5">
          {node.evolvesTo.map((child) => (
            <EvolutionBranch
              currentPokemonName={currentPokemonName}
              key={child.name}
              node={child}
              onSelectPokemon={onSelectPokemon}
            />
          ))}
        </div>
      )}
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

const moveCategoryClasses: Record<string, string> = {
  physical: 'text-[#fecaca] bg-[rgba(239,68,68,0.18)]',
  special: 'text-[#bfdbfe] bg-[rgba(59,130,246,0.18)]',
  status: 'text-[#ddd6fe] bg-[rgba(139,92,246,0.18)]',
}

function MoveCard({ move }: { move: PokemonMove }) {
  return (
    <article className="grid min-h-[46px] gap-2.5 rounded-2xl border border-line bg-white/[0.04] p-3">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base">{move.displayName}</h3>
        <strong className="shrink-0 text-[0.82rem] text-[#e0f2fe]">{formatMoveLevel(move)}</strong>
      </header>
      <div className="flex flex-wrap gap-[7px]">
        {move.type && <TypeBadges types={[move.type]} />}
        {move.category && (
          <span
            className={`inline-flex min-h-[28px] w-fit items-center justify-center whitespace-nowrap rounded-full px-[0.65rem] py-[0.35rem] text-[0.72rem] font-extrabold uppercase leading-none ${moveCategoryClasses[move.category] ?? 'bg-[rgba(148,163,184,0.16)] text-[#e5e7eb]'}`}
          >
            {move.categoryLabel ?? move.category}
          </span>
        )}
      </div>
      <dl className="m-0 grid grid-cols-3 gap-2">
        <div className="min-w-0 rounded-xl bg-[rgba(2,6,23,0.38)] p-2">
          <dt className="text-[0.68rem] font-extrabold uppercase text-muted">Power</dt>
          <dd className="mt-0.5 font-extrabold">{formatMoveValue(move.power)}</dd>
        </div>
        <div className="min-w-0 rounded-xl bg-[rgba(2,6,23,0.38)] p-2">
          <dt className="text-[0.68rem] font-extrabold uppercase text-muted">Accuracy</dt>
          <dd className="mt-0.5 font-extrabold">{formatMoveValue(move.accuracy)}</dd>
        </div>
        <div className="min-w-0 rounded-xl bg-[rgba(2,6,23,0.38)] p-2">
          <dt className="text-[0.68rem] font-extrabold uppercase text-muted">PP</dt>
          <dd className="mt-0.5 font-extrabold">{formatMoveValue(move.pp)}</dd>
        </div>
      </dl>
      <p className="text-[0.9rem] text-ivory-soft">{move.shortEffect || move.effect || 'Descricao nao informada'}</p>
    </article>
  )
}

function formatMoveLevel(move: PokemonMove) {
  if (move.learnedAtLevel === null) {
    return 'Lv. ?'
  }

  return move.learnedAtLevel <= 1 ? 'Lv. 1' : `Lv. ${move.learnedAtLevel}`
}

function formatMoveValue(value: number | null | undefined) {
  return value ?? '-'
}
