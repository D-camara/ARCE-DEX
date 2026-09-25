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
import * as m from 'motion/react-m'
import { duration, ease, EmptyHint, stagger } from '@/shared/ui'

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

const tabButtonBase =
  'min-h-11 whitespace-nowrap rounded-lg border border-transparent bg-transparent px-4 text-[0.88rem] font-bold uppercase tracking-wide text-ivory-soft transition-all hover:bg-white/[0.03] hover:text-ivory'
const tabButtonActive =
  'border-gilt/30 bg-gilt/10 text-gold shadow-glow-gold [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]'

export function PokemonTabs({ activeTab, data, onSelectPokemon, onTabChange }: PokemonTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<PokemonTabName>('Info')
  const selectedTab = activeTab ?? internalActiveTab

  function handleTabChange(tab: PokemonTabName) {
    setInternalActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <section className="-mt-4 rounded-b-3xl border border-parchment/12 border-t-parchment/8 bg-ink/70 p-6 max-sm:p-4 shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_0_30px_rgba(246,237,211,0.02)]">
      <div
        className="mb-4 flex gap-2 overflow-x-auto border-b border-parchment/6 pb-3"
        role="tablist"
        aria-label="Dados do Pokémon"
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
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {data.moves.length > 0 ? (
              data.moves.map((move, index) => (
                <m.div
                  key={move.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: duration.base, ease: ease.out, delay: Math.min(index, 8) * stagger },
                  }}
                >
                  <MoveCard move={move} />
                </m.div>
              ))
            ) : (
              <EmptyHint>Nenhum golpe carregado.</EmptyHint>
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
                      ? 'grid w-full max-w-[280px] min-h-[84px] cursor-pointer grid-cols-[58px_1fr] items-center gap-2.5 rounded-2xl border border-gilt/50 bg-gilt/12 p-2.5 text-left text-ivory shadow-glow-gold'
                      : 'grid w-full max-w-[280px] min-h-[84px] cursor-pointer grid-cols-[58px_1fr] items-center gap-2.5 rounded-2xl border border-line bg-white/[0.04] p-2.5 text-left text-ivory transition-colors hover:border-gilt/40 hover:bg-gilt/8'
                  }
                  key={form.name}
                  onClick={() => onSelectPokemon?.(form.name)}
                  type="button"
                >
                  {form.sprite && <img src={form.sprite} alt="" className="h-[58px] w-[58px] object-contain" />}
                  <span className="grid min-w-0 gap-1">
                    <strong>{form.displayName}</strong>
                    {form.id !== null && (
                      <small className="text-xs text-muted">
                        #{String(form.id).padStart(4, '0')}
                      </small>
                    )}
                    <em className="text-xs not-italic text-muted">{form.category}</em>
                    {form.types && form.types.length > 0 && <TypeBadges compact types={form.types} />}
                  </span>
                </button>
              ))
            ) : (
              <EmptyHint>Nenhuma forma alternativa encontrada para este Pokémon.</EmptyHint>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function InfoPanel({ items }: { items: PokemonTabData['infoItems'] }) {
  if (items.length === 0) {
    return <EmptyHint>Dados extras não carregados.</EmptyHint>
  }

  return (
    <dl className="m-0 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
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
              className="inline-flex min-h-[28px] w-fit max-w-max items-center justify-center gap-1 whitespace-nowrap rounded-full border border-line bg-surface-2 px-[0.65rem] py-[0.35rem] text-xs font-extrabold uppercase leading-none text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]"
            >
              {item.type} {formatMultiplier(item.multiplier)}
            </span>
          ))}
        </div>
      ) : (
        <EmptyHint>Nenhum item neste grupo.</EmptyHint>
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
    return <EmptyHint>Linha evolutiva não carregada.</EmptyHint>
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
            ? 'inline-grid w-[min(128px,100%)] min-h-[128px] cursor-pointer gap-1 rounded-2xl border border-gilt/50 bg-gilt/12 p-2.5 text-center text-ivory shadow-glow-gold transition-all'
            : 'inline-grid w-[min(128px,100%)] min-h-[128px] cursor-pointer gap-1 rounded-2xl border border-line bg-white/[0.04] p-2.5 text-center text-ivory transition-all hover:-translate-y-0.5 hover:border-gilt/40 hover:bg-gilt/8 hover:shadow-glow-gold'
        }
        onClick={() => onSelectPokemon?.(node.name)}
        type="button"
      >
        {node.sprite && (
          <img src={node.sprite} alt="" className="h-[68px] w-[68px] justify-self-center object-contain" />
        )}
        <strong>{node.displayName}</strong>
        {node.id !== null && <small className="text-xs text-muted">#{String(node.id).padStart(4, '0')}</small>}
        <small className="text-xs text-muted">{node.method}</small>
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
  physical: 'text-danger-200 bg-danger-500/18',
  special: 'text-info-200 bg-info-500/18',
  status: 'text-arcane-violet-200 bg-arcane-violet-500/18',
}

function MoveCard({ move }: { move: PokemonMove }) {
  return (
    <article className="grid min-h-[46px] gap-2.5 rounded-2xl border border-line bg-white/[0.04] p-3">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base">{move.displayName}</h3>
        <strong className="shrink-0 text-[0.82rem] text-azure-100">{formatMoveLevel(move)}</strong>
      </header>
      <div className="flex flex-wrap gap-[7px]">
        {move.type && <TypeBadges types={[move.type]} />}
        {move.category && (
          <span
            className={`inline-flex min-h-[28px] w-fit items-center justify-center whitespace-nowrap rounded-full px-[0.65rem] py-[0.35rem] text-xs font-extrabold uppercase leading-none ${moveCategoryClasses[move.category] ?? 'bg-mist/16 text-mist-200'}`}
          >
            {move.categoryLabel ?? move.category}
          </span>
        )}
      </div>
      <dl className="m-0 grid grid-cols-3 gap-2">
        <div className="min-w-0 rounded-xl bg-abyss/38 p-2">
          <dt className="text-xs font-extrabold uppercase text-muted">Power</dt>
          <dd className="mt-0.5 font-extrabold">{formatMoveValue(move.power)}</dd>
        </div>
        <div className="min-w-0 rounded-xl bg-abyss/38 p-2">
          <dt className="text-xs font-extrabold uppercase text-muted">Accuracy</dt>
          <dd className="mt-0.5 font-extrabold">{formatMoveValue(move.accuracy)}</dd>
        </div>
        <div className="min-w-0 rounded-xl bg-abyss/38 p-2">
          <dt className="text-xs font-extrabold uppercase text-muted">PP</dt>
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
