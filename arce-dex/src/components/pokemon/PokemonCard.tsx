import { useState } from 'react'
import { Heart, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import type { Pokemon, PokemonStatName } from '../../types/pokemon'
import { TypeBadges } from './TypeBadges'

type PokemonCardProps = {
  pokemon: Pokemon
  isFavorite: boolean
  onAddToTeam: () => void
  onToggleFavorite: () => void
}

const statLabels: Record<PokemonStatName, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'Spe',
}

export function PokemonCard({
  pokemon,
  isFavorite,
  onAddToTeam,
  onToggleFavorite,
}: PokemonCardProps) {
  const [isShiny, setIsShiny] = useState(false)
  const displayedSprite = isShiny && pokemon.shinySprite ? pokemon.shinySprite : pokemon.imageUrl

  return (
    <article className="pokemon-card">
      <div className="pokemon-card__media">
        <div>
          <p className="eyebrow">#{String(pokemon.id).padStart(4, '0')}</p>
          <h2>{pokemon.displayName}</h2>
          <p>{pokemon.types.join(' / ')}</p>
        </div>
        <div className="pokemon-card__sprite">
          <img src={displayedSprite} alt={pokemon.displayName} />
          {pokemon.shinySprite && (
            <button
              className={isShiny ? 'shiny-toggle is-active' : 'shiny-toggle'}
              onClick={() => setIsShiny((value) => !value)}
              type="button"
            >
              <Sparkles size={15} />
              {isShiny ? 'Mostrar normal' : 'Mostrar shiny'}
            </button>
          )}
        </div>
      </div>

      <TypeBadges types={pokemon.types} />

      <dl className="pokemon-facts pokemon-facts--compact">
        <div>
          <dt>Altura</dt>
          <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
        </div>
        <div>
          <dt>Peso</dt>
          <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
        </div>
      </dl>

      <AbilityList abilities={pokemon.abilities} />

      <div className="stat-list">
        {Object.entries(pokemon.stats).map(([name, value]) => (
          <StatBar key={name} label={statLabels[name as PokemonStatName]} value={value} />
        ))}
      </div>

      <div className="card-actions">
        <button className="primary-action" type="button" onClick={onAddToTeam}>
          <Plus size={18} />
          Adicionar
        </button>
        <button
          className={isFavorite ? 'icon-action is-favorite' : 'icon-action'}
          type="button"
          onClick={onToggleFavorite}
        >
          <Heart fill={isFavorite ? 'currentColor' : 'none'} size={18} />
          <span className="sr-only">Favoritar</span>
        </button>
        <button className="icon-action" type="button">
          <ShieldCheck size={18} />
          <span className="sr-only">Analisar tipos</span>
        </button>
      </div>
    </article>
  )
}

function AbilityList({ abilities }: { abilities: Pokemon['abilities'] }) {
  return (
    <section className="ability-list" aria-label="Habilidades">
      {abilities.map((ability) => (
        <span key={ability.name}>{ability.displayName}</span>
      ))}
    </section>
  )
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-bar">
      <span>{label}</span>
      <div className="stat-track">
        <i style={{ width: `${Math.min(value, 150) / 1.5}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  )
}
