import type { PokemonAbility, PokemonMove, PokemonStatName, PokemonStats } from '../../types/pokemon'
import type { CompetitiveStatTable, PokemonNature, TeamPokemon, TeamRole } from '../../types/team'
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
  const evTotal = COMPETITIVE_STAT_NAMES.reduce((total, stat) => total + evs[stat], 0)
  const datalistId = `moves-${normalizedPokemon.id}`
  const abilityDatalistId = `abilities-${normalizedPokemon.id}`
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

  return (
    <section className="team-editor-panel">
      <header>
        <div>
          <p className="eyebrow">Editor</p>
          <h2>{normalizedPokemon.displayName}</h2>
        </div>
        <img src={normalizedPokemon.sprite} alt="" />
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
            value={normalizedPokemon.item}
            onChange={(event) => onChange({ item: event.target.value })}
          />
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

      <section className="editor-section">
        <h3>Moves</h3>
        <div className="move-editor-grid">
          {[0, 1, 2, 3].map((moveIndex) => (
            <label key={moveIndex}>
              Move {moveIndex + 1}
              <input
                list={datalistId}
                value={moves[moveIndex] ?? ''}
                onChange={(event) => updateMove(moveIndex, event.target.value)}
              />
            </label>
          ))}
          <datalist id={datalistId}>
            {moveOptions.map((move) => (
              <option key={move.name} value={move.name}>
                {move.displayName}
              </option>
            ))}
          </datalist>
        </div>
      </section>

      <section className="editor-section">
        <header className="editor-section-header">
          <h3>EVs e IVs</h3>
          <span className={evTotal > 510 ? 'ev-total is-invalid' : 'ev-total'}>
            {evTotal}/510 EVs
          </span>
        </header>
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

      <label className="notes-field">
        Notes
        <textarea
          value={normalizedPokemon.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </label>
    </section>
  )
}
