import { Package } from 'lucide-react'
import type {
  MoveDetail,
  PokemonAbility,
  PokemonMove,
  PokemonStatName,
  PokemonStats,
} from '../../types/pokemon'
import type { CompetitiveStatTable, PokemonNature, TeamPokemon, TeamRole } from '../../types/team'
import { TypeBadges } from '../pokemon/TypeBadges'
import { calculateHiddenPowerType } from '../../lib/hidden-power'
import { findHeldItemOption, getCuratedHeldItems, searchHeldItemOptions } from '../../lib/items'
import {
  COMPETITIVE_STAT_NAMES,
  calculateFinalStats,
  getDefaultEvs,
  getDefaultIvs,
  normalizeCompetitivePokemon,
} from '../../lib/stats'

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
      <section className="team-editor-panel">
        <p className="eyebrow">Editor</p>
        <h2>Selecione um slot</h2>
        <p className="empty-copy">Escolha um Pokemon do time para editar dados competitivos.</p>
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
    <section className="team-editor-panel">
      <header>
        <div>
          <p className="eyebrow">Editor</p>
          <h2>{normalizedPokemon.displayName}</h2>
        </div>
        <img src={normalizedPokemon.sprite} alt="" />
      </header>

      <section className="editor-section editor-card">
        <header className="editor-section-header">
          <h3>Basico</h3>
          <span>Lv. {normalizedPokemon.level}</span>
        </header>
        <div className="editor-grid">
          <label>
            Level
            <input
              max={100}
              min={1}
              type="number"
              value={normalizedPokemon.level}
              onChange={(event) => onChange({ level: Number(event.target.value) })}
            />
          </label>
          <label>
            Nature
            <select
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
          <label>
            Role
            <select
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

      <section className="editor-section editor-card">
        <h3>Item e Ability</h3>
        <div className="editor-grid">
          <label>
            Ability
            <input
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
          <label>
            Held item
            <input
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
          <p className="editor-help">
            <Package className="held-item-inline-icon" size={15} />
            <strong>{selectedHeldItem.displayName}</strong>
            {selectedHeldItem.shortEffect ? `: ${selectedHeldItem.shortEffect}` : ''}
          </p>
        ) : (
          <p className="editor-help">Escolha um item curado ou digite um item livre.</p>
        )}
        <div className="item-option-strip">
          {visibleHeldItems.map((item) => (
            <button key={item.id} type="button" onClick={() => onChange({ item: item.name })}>
              <Package size={14} />
              {item.displayName}
            </button>
          ))}
        </div>
      </section>

      <section className="editor-section editor-card">
        <header className="editor-section-header">
          <h3>Golpes</h3>
          <span>{moves.length}/4</span>
        </header>
        <div className="move-editor-grid">
          {[0, 1, 2, 3].map((moveIndex) => {
            const moveName = moves[moveIndex] ?? ''
            const moveDetail = getMoveDetail(moveName)
            const move = getMoveOption(moveName)
            const learnMethod = moveDetail?.learnMethod ?? move?.learnMethod ?? 'unknown'
            const learnMethodBadge = getLearnMethodBadge(learnMethod)

            return (
              <div className="move-row" key={moveIndex}>
                <label>
                  Move {moveIndex + 1}
                  <input
                    list={datalistId}
                    value={moveName}
                    onChange={(event) => updateMove(moveIndex, event.target.value)}
                  />
                </label>
                {moveDetail ? (
                  <div className="move-detail-card">
                    <div>
                      <TypeBadges compact types={[moveDetail.type]} />
                      <span>{moveDetail.category}</span>
                    </div>
                    <dl>
                      <div>
                        <dt>Power</dt>
                        <dd>{moveDetail.power ?? '-'}</dd>
                      </div>
                      <div>
                        <dt>Acc.</dt>
                        <dd>{moveDetail.accuracy ?? '-'}</dd>
                      </div>
                      <div>
                        <dt>PP</dt>
                        <dd>{moveDetail.pp ?? '-'}</dd>
                      </div>
                    </dl>
                    <p>{moveDetail.shortEffect ?? 'Sem efeito curto encontrado na PokeAPI.'}</p>
                    <p className="move-meta">
                      <span className={`move-method-badge method-${learnMethodBadge.toLowerCase()}`}>
                        {learnMethodBadge}
                      </span>
                      {moveDetail.learnedAtLevel !== null
                        ? ` · Lv. ${moveDetail.learnedAtLevel}`
                        : ''}
                    </p>
                  </div>
                ) : move ? (
                  <p className="move-meta">
                    <span className={`move-method-badge method-${learnMethodBadge.toLowerCase()}`}>
                      {learnMethodBadge}
                    </span>
                    {move.displayName} · {move.learnMethod}
                    {move.learnedAtLevel !== null ? ` · Lv. ${move.learnedAtLevel}` : ''}
                  </p>
                ) : (
                  <p className="move-meta">Selecione um golpe retornado pela PokeAPI.</p>
                )}
                {moveName ? (
                  <button type="button" onClick={() => clearMove(moveIndex)}>
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

      <section className="editor-section editor-card">
        <header className="editor-section-header">
          <h3>Stats</h3>
          <span className={evTotal > 510 ? 'ev-total is-invalid' : 'ev-total'}>
            {evTotal}/510 EVs
          </span>
        </header>
        {evTotal > 510 ? (
          <p className="editor-alert">O total recomendado competitivo e 510 EVs.</p>
        ) : null}
        <div className="stat-editor-grid">
          {COMPETITIVE_STAT_NAMES.map((stat) => (
            <div className="stat-editor-row" key={stat}>
              <strong>{statLabels[stat]}</strong>
              <label>
                EV
                <input
                  max={252}
                  min={0}
                  type="number"
                  value={evs[stat]}
                  onChange={(event) => updateStat('evs', stat, event.target.value)}
                />
              </label>
              <label>
                IV
                <input
                  max={31}
                  min={0}
                  type="number"
                  value={ivs[stat]}
                  onChange={(event) => updateStat('ivs', stat, event.target.value)}
                />
              </label>
              <span>Base {calculatedStats?.[stat].base ?? '-'}</span>
              <span>Final {calculatedStats?.[stat].final ?? '-'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="editor-section editor-card hidden-power-panel">
        <header className="editor-section-header">
          <h3>Hidden Power</h3>
          <TypeBadges compact types={[hiddenPower.type]} />
        </header>
        <p className="editor-help">
          Calculadora classica baseada na paridade dos IVs. O tipo atual e{' '}
          <strong>{hiddenPower.type}</strong>.
        </p>
        {hiddenPower.isPerfectIvSpread ? (
          <p className="editor-alert">Todos os IVs em 31 geralmente resultam em Hidden Power Dark.</p>
        ) : null}
        <div className="hp-iv-grid">
          {COMPETITIVE_STAT_NAMES.map((stat) => (
            <span key={stat}>
              {statLabels[stat]} <strong>{ivs[stat]}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className="editor-section editor-card">
        <label className="notes-field">
          Notes
          <textarea
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
