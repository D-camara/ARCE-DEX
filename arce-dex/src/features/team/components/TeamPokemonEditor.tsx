import { Package } from 'lucide-react'
import type {
  MoveDetail,
  PokemonAbility,
  PokemonMove,
  PokemonStatName,
  PokemonStats,
} from '@/shared/types/pokemon'
import type { CompetitiveStatTable, PokemonNature, TeamPokemon, TeamRole } from '@/shared/types/team'
import { TypeBadges } from '@/features/pokemon/components/TypeBadges'
import { calculateHiddenPowerType } from '@/shared/lib/hidden-power'
import { findHeldItemOption, getCuratedHeldItems, searchHeldItemOptions } from '@/shared/lib/items'
import {
  COMPETITIVE_STAT_NAMES,
  calculateFinalStats,
  getDefaultEvs,
  getDefaultIvs,
  normalizeCompetitivePokemon,
} from '@/shared/lib/stats'

type TeamPokemonEditorProps = {
  abilityOptions?: PokemonAbility[]
  pokemon: TeamPokemon | null
  moveDetails?: Record<string, MoveDetail>
  moveOptions?: PokemonMove[]
  fetchedBaseStats?: PokemonStats
  onChange: (updates: Partial<TeamPokemon>) => void
}

const natureOptions: PokemonNature[] = [
  'neutral',
  'adamant',
  'modest',
  'timid',
  'jolly',
  'bold',
  'calm',
  'careful',
  'impish',
  'brave',
  'quiet',
  'sassy',
]

const roleOptions: Array<{ label: string; value: TeamRole }> = [
  { label: 'Sem funcao', value: '' },
  { label: 'Sweeper fisico', value: 'physical-sweeper' },
  { label: 'Sweeper especial', value: 'special-sweeper' },
  { label: 'Tank fisico', value: 'physical-tank' },
  { label: 'Tank especial', value: 'special-tank' },
  { label: 'Suporte', value: 'support' },
  { label: 'Lead', value: 'lead' },
  { label: 'Pivot', value: 'pivot' },
  { label: 'Wallbreaker', value: 'wallbreaker' },
  { label: 'Hazard setter', value: 'hazard-setter' },
  { label: 'Hazard remover', value: 'hazard-remover' },
]

const statLabels: Record<PokemonStatName, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

const editorCardClass = 'grid gap-2.5 rounded-2xl border border-line bg-[rgba(18,22,32,0.4)] p-3.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]'
const editorSectionHeaderClass = 'flex flex-wrap items-center justify-between gap-3'
const editorGridClass = 'grid gap-2.5'
const labelClass = 'grid gap-1.5 text-[0.78rem] font-extrabold'
const inputClass =
  'w-full min-h-[46px] rounded-xl border border-line bg-[rgba(18,22,32,0.6)] px-2.5 py-2 text-ivory shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all focus:border-[rgba(212,175,55,0.5)] focus:bg-[rgba(18,22,32,0.8)] focus:shadow-[0_0_0_2px_rgba(212,175,55,0.15),inset_0_2px_4px_rgba(0,0,0,0.3)] focus:outline-none'
const helpTextClass = 'text-[0.82rem] leading-relaxed text-muted'
const pillButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-line bg-[rgba(18,22,32,0.6)] px-3.5 text-[0.78rem] text-ivory-soft transition-all hover:border-[rgba(56,189,248,0.4)] hover:bg-[rgba(56,189,248,0.1)] hover:text-ivory'

const methodBadgeClasses: Record<string, string> = {
  level: 'border-[rgba(34,197,94,0.34)] text-[#bbf7d0] bg-[rgba(34,197,94,0.12)]',
  tm: 'border-[rgba(56,189,248,0.34)] text-[#bae6fd] bg-[rgba(56,189,248,0.12)]',
  hm: 'border-[rgba(56,189,248,0.34)] text-[#bae6fd] bg-[rgba(56,189,248,0.12)]',
  tr: 'border-[rgba(56,189,248,0.34)] text-[#bae6fd] bg-[rgba(56,189,248,0.12)]',
  tutor: 'border-[rgba(168,85,247,0.34)] text-[#e9d5ff] bg-[rgba(168,85,247,0.12)]',
  egg: 'border-[rgba(168,85,247,0.34)] text-[#e9d5ff] bg-[rgba(168,85,247,0.12)]',
}

function methodBadgeClass(method: string) {
  const key = method.toLowerCase()
  return `inline-flex min-h-[22px] items-center rounded-full border px-2 text-[0.68rem] font-black uppercase ${
    methodBadgeClasses[key] ?? 'border-[rgba(148,163,184,0.3)] text-ivory bg-white/[0.08]'
  }`
}

export function TeamPokemonEditor({
  abilityOptions = [],
  fetchedBaseStats,
  moveDetails = {},
  moveOptions = [],
  onChange,
  pokemon,
}: TeamPokemonEditorProps) {
  if (!pokemon) {
    return (
      <section className="grid gap-2.5 rounded-card border border-line bg-[rgba(18,22,32,0.7)] p-4 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <p className="text-gold">Editor</p>
        <h2>Selecione um slot</h2>
        <p className="text-center italic tracking-wide text-muted opacity-80">
          Escolha um Pokemon do time para editar dados competitivos.
        </p>
      </section>
    )
  }

  const normalizedPokemon = normalizeCompetitivePokemon({
    ...pokemon,
    baseStats: pokemon.baseStats ?? fetchedBaseStats,
  })
  const evs = normalizedPokemon.evs ?? getDefaultEvs()
  const ivs = normalizedPokemon.ivs ?? getDefaultIvs()
  const moves = normalizedPokemon.moves ?? []
  const heldItemName = normalizedPokemon.item ?? ''
  const evTotal = COMPETITIVE_STAT_NAMES.reduce((total, stat) => total + evs[stat], 0)
  const datalistId = `moves-${normalizedPokemon.id}`
  const abilityDatalistId = `abilities-${normalizedPokemon.id}`
  const itemDatalistId = `held-items-${normalizedPokemon.id}`
  const heldItemOptions = getCuratedHeldItems()
  const selectedHeldItem = findHeldItemOption(heldItemName)
  const visibleHeldItems = searchHeldItemOptions(heldItemName, 6)
  const hiddenPower = calculateHiddenPowerType(ivs)
  const calculatedStats =
    normalizedPokemon.baseStats &&
    calculateFinalStats(normalizedPokemon.baseStats, normalizedPokemon)

  function updateStat(
    key: 'evs' | 'ivs',
    stat: PokemonStatName,
    value: string,
  ) {
    const fallback = key === 'evs' ? evs : ivs

    onChange({
      [key]: {
        ...fallback,
        [stat]: Number(value),
      } as CompetitiveStatTable,
    })
  }

  function updateMove(index: number, value: string) {
    const nextMoves = Array.from({ length: 4 }, (_, moveIndex) => moves[moveIndex] ?? '')
    nextMoves[index] = value

    onChange({ moves: nextMoves.filter((move) => move.trim().length > 0) })
  }

  function clearMove(index: number) {
    updateMove(index, '')
  }

  function getMoveOption(moveName: string) {
    const normalizedMoveName = normalizeMoveName(moveName)

    return moveOptions.find((move) => move.name === normalizedMoveName)
  }

  function getMoveDetail(moveName: string) {
    return moveDetails[normalizeMoveName(moveName)]
  }

  return (
    <section className="grid gap-3.5 min-[760px]:grid-cols-2">
      <section className={`${editorCardClass} min-[760px]:col-span-2`}>
        <header className={editorSectionHeaderClass}>
          <h3>Basico</h3>
          <span>Lv. {normalizedPokemon.level}</span>
        </header>
        <div className={`${editorGridClass} min-[600px]:grid-cols-3`}>
          <label className={labelClass}>
            Level
            <input
              className={inputClass}
              max={100}
              min={1}
              type="number"
              value={normalizedPokemon.level}
              onChange={(event) => onChange({ level: Number(event.target.value) })}
            />
          </label>
          <label className={labelClass}>
            Nature
            <select
              className={inputClass}
              value={normalizedPokemon.nature}
              onChange={(event) => onChange({ nature: event.target.value as PokemonNature })}
            >
              {natureOptions.map((nature) => (
                <option key={nature} value={nature}>
                  {nature}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Role
            <select
              className={inputClass}
              value={normalizedPokemon.role}
              onChange={(event) => onChange({ role: event.target.value as TeamRole })}
            >
              {roleOptions.map((role) => (
                <option key={role.value || 'none'} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={`${editorCardClass} min-[760px]:col-span-2`}>
        <h3>Item e Ability</h3>
        <div className={`${editorGridClass} min-[600px]:grid-cols-2`}>
          <label className={labelClass}>
            Ability
            <input
              className={inputClass}
              list={abilityDatalistId}
              value={normalizedPokemon.ability}
              onChange={(event) => onChange({ ability: event.target.value })}
            />
            <datalist id={abilityDatalistId}>
              {abilityOptions.map((ability) => (
                <option key={ability.name} value={ability.name}>
                  {ability.displayName}
                </option>
              ))}
            </datalist>
          </label>
          <label className={labelClass}>
            Held item
            <input
              className={inputClass}
              list={itemDatalistId}
              value={heldItemName}
              onChange={(event) => onChange({ item: event.target.value })}
            />
            <datalist id={itemDatalistId}>
              {heldItemOptions.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.displayName}
                </option>
              ))}
            </datalist>
          </label>
        </div>
        {selectedHeldItem ? (
          <p className={helpTextClass}>
            <Package className="mr-1.5 inline-block align-[-2px] text-gold" size={15} />
            <strong className="text-ivory">{selectedHeldItem.displayName}</strong>
            {selectedHeldItem.shortEffect ? `: ${selectedHeldItem.shortEffect}` : ''}
          </p>
        ) : (
          <p className={helpTextClass}>Escolha um item curado ou digite um item livre.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {visibleHeldItems.map((item) => (
            <button key={item.id} type="button" className={pillButtonClass} onClick={() => onChange({ item: item.name })}>
              <Package size={14} />
              {item.displayName}
            </button>
          ))}
        </div>
      </section>

      <section className={`${editorCardClass} min-[760px]:col-span-2`}>
        <header className={editorSectionHeaderClass}>
          <h3>Golpes</h3>
          <span>{moves.length}/4</span>
        </header>
        <div className={`${editorGridClass} min-[760px]:grid-cols-2`}>
          {[0, 1, 2, 3].map((moveIndex) => {
            const moveName = moves[moveIndex] ?? ''
            const moveDetail = getMoveDetail(moveName)
            const move = getMoveOption(moveName)
            const learnMethod = moveDetail?.learnMethod ?? move?.learnMethod ?? 'unknown'
            const learnMethodBadge = getLearnMethodBadge(learnMethod)

            return (
              <div
                className="relative grid min-w-0 gap-2.5 overflow-hidden rounded-2xl border border-line bg-surface-2 p-3"
                key={moveIndex}
              >
                <label className={labelClass}>
                  Move {moveIndex + 1}
                  <input
                    className={inputClass}
                    list={datalistId}
                    value={moveName}
                    onChange={(event) => updateMove(moveIndex, event.target.value)}
                  />
                </label>
                {moveDetail ? (
                  <div className="grid gap-2 rounded-2xl border border-[rgba(139,92,246,0.22)] bg-[rgba(139,92,246,0.06)] p-3 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadges compact types={[moveDetail.type]} />
                      <span className="rounded-full bg-white/[0.08] px-2 py-1 text-[0.72rem] font-extrabold capitalize text-ivory">
                        {moveDetail.category}
                      </span>
                    </div>
                    <dl className="m-0 flex flex-wrap items-center gap-2">
                      <div className="grid min-w-[54px] gap-0.5 rounded-lg bg-[rgba(2,6,23,0.36)] px-2 py-1.5">
                        <dt className="text-[0.66rem] font-extrabold uppercase text-muted">Power</dt>
                        <dd className="m-0 text-[0.86rem] font-extrabold text-ivory">{moveDetail.power ?? '-'}</dd>
                      </div>
                      <div className="grid min-w-[54px] gap-0.5 rounded-lg bg-[rgba(2,6,23,0.36)] px-2 py-1.5">
                        <dt className="text-[0.66rem] font-extrabold uppercase text-muted">Acc.</dt>
                        <dd className="m-0 text-[0.86rem] font-extrabold text-ivory">{moveDetail.accuracy ?? '-'}</dd>
                      </div>
                      <div className="grid min-w-[54px] gap-0.5 rounded-lg bg-[rgba(2,6,23,0.36)] px-2 py-1.5">
                        <dt className="text-[0.66rem] font-extrabold uppercase text-muted">PP</dt>
                        <dd className="m-0 text-[0.86rem] font-extrabold text-ivory">{moveDetail.pp ?? '-'}</dd>
                      </div>
                    </dl>
                    <p className="m-0 text-[0.8rem] leading-snug text-muted">
                      {moveDetail.shortEffect ?? 'Sem efeito curto encontrado na PokeAPI.'}
                    </p>
                    <p className={`${helpTextClass} [overflow-wrap:anywhere]`}>
                      <span className={methodBadgeClass(learnMethodBadge)}>{learnMethodBadge}</span>
                      {moveDetail.learnedAtLevel !== null ? ` · Lv. ${moveDetail.learnedAtLevel}` : ''}
                    </p>
                  </div>
                ) : move ? (
                  <p className={`${helpTextClass} [overflow-wrap:anywhere]`}>
                    <span className={methodBadgeClass(learnMethodBadge)}>{learnMethodBadge}</span>
                    {' '}
                    {move.displayName} · {move.learnMethod}
                    {move.learnedAtLevel !== null ? ` · Lv. ${move.learnedAtLevel}` : ''}
                  </p>
                ) : (
                  <p className={helpTextClass}>Selecione um golpe retornado pela PokeAPI.</p>
                )}
                {moveName ? (
                  <button type="button" className={`${pillButtonClass} justify-self-start`} onClick={() => clearMove(moveIndex)}>
                    Remover
                  </button>
                ) : null}
              </div>
            )
          })}
          <datalist id={datalistId}>
            {moveOptions.map((move) => (
              <option key={move.name} value={move.name}>
                {move.displayName}
              </option>
            ))}
          </datalist>
        </div>
      </section>

      <section className={`${editorCardClass} min-[760px]:col-span-2`}>
        <header className={editorSectionHeaderClass}>
          <h3>Stats</h3>
          <span
            className={
              evTotal > 510
                ? 'rounded-full border border-[rgba(251,113,133,0.48)] bg-[rgba(251,113,133,0.14)] px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-wide text-[#fecdd3] shadow-[0_0_15px_rgba(251,113,133,0.2)]'
                : 'rounded-full border border-[rgba(56,189,248,0.38)] bg-[rgba(56,189,248,0.12)] px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-wide text-[#e0f2fe] shadow-glow-blue'
            }
          >
            {evTotal}/510 EVs
          </span>
        </header>
        {evTotal > 510 ? (
          <p className="rounded-xl border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] p-3 text-ivory shadow-glow-gold">
            O total recomendado competitivo e 510 EVs.
          </p>
        ) : null}
        <div className="grid gap-2.5">
          {COMPETITIVE_STAT_NAMES.map((stat) => (
            <div
              className="grid grid-cols-[minmax(56px,0.55fr)_repeat(2,minmax(0,1fr))] items-end gap-2 rounded-2xl border border-line bg-white/[0.04] p-2.5"
              key={stat}
            >
              <strong>{statLabels[stat]}</strong>
              <label className={labelClass}>
                EV
                <input
                  className={inputClass}
                  max={252}
                  min={0}
                  type="number"
                  value={evs[stat]}
                  onChange={(event) => updateStat('evs', stat, event.target.value)}
                />
              </label>
              <label className={labelClass}>
                IV
                <input
                  className={inputClass}
                  max={31}
                  min={0}
                  type="number"
                  value={ivs[stat]}
                  onChange={(event) => updateStat('ivs', stat, event.target.value)}
                />
              </label>
              <span className="col-[1/-1] text-[0.78rem] text-ivory-soft">
                Base {calculatedStats?.[stat].base ?? '-'}
              </span>
              <span className="col-[1/-1] text-[0.78rem] text-ivory-soft">
                Final {calculatedStats?.[stat].final ?? '-'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={editorCardClass}>
        <header className={editorSectionHeaderClass}>
          <h3>Hidden Power</h3>
          <TypeBadges compact types={[hiddenPower.type]} />
        </header>
        <p className={helpTextClass}>
          Calculadora classica baseada na paridade dos IVs. O tipo atual e{' '}
          <strong className="text-ivory">{hiddenPower.type}</strong>.
        </p>
        {hiddenPower.isPerfectIvSpread ? (
          <p className="rounded-xl border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] p-3 text-ivory shadow-glow-gold">
            Todos os IVs em 31 geralmente resultam em Hidden Power Dark.
          </p>
        ) : null}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
          {COMPETITIVE_STAT_NAMES.map((stat) => (
            <span
              key={stat}
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-[rgba(2,6,23,0.36)] px-2.5 py-2 text-[0.8rem] text-muted"
            >
              {statLabels[stat]} <strong className="text-ivory">{ivs[stat]}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className={editorCardClass}>
        <label className={labelClass}>
          Notes
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={normalizedPokemon.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
          />
        </label>
      </section>
    </section>
  )
}

function normalizeMoveName(moveName: string): string {
  return moveName.trim().toLowerCase().replace(/[_\s]+/g, '-')
}

function getLearnMethodBadge(method: string): 'Level' | 'TM' | 'HM' | 'TR' | 'Tutor' | 'Egg' | 'Unknown' {
  const normalizedMethod = method.trim().toLowerCase()

  if (normalizedMethod === 'level-up' || normalizedMethod.includes('level')) {
    return 'Level'
  }

  if (normalizedMethod === 'egg') {
    return 'Egg'
  }

  if (normalizedMethod.includes('tutor')) {
    return 'Tutor'
  }

  if (normalizedMethod.includes('hm')) {
    return 'HM'
  }

  if (normalizedMethod.includes('tr')) {
    return 'TR'
  }

  if (normalizedMethod === 'machine' || normalizedMethod.includes('tm')) {
    return 'TM'
  }

  return 'Unknown'
}
