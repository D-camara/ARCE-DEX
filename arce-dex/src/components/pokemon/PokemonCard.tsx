import { useState } from 'react'
import { Heart, Info, Plus, ShieldCheck, Sparkles, Volume2 } from 'lucide-react'
import type { Pokemon, PokemonStatName } from '../../types/pokemon'
import { TypeBadges } from './TypeBadges'

type PokemonCardProps = {
  pokemon: Pokemon
  isFavorite: boolean
  onAddToTeam: () => void
  onPlayCry: () => void
  onSelectAbility: (abilityName: string) => void
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
  onPlayCry,
  onSelectAbility,
  onToggleFavorite,
}: PokemonCardProps) {
  const [isShiny, setIsShiny] = useState(false)
  const displayedSprite = isShiny && pokemon.shinySprite ? pokemon.shinySprite : pokemon.imageUrl

  return (
    <article className="legendary-artifact">
      <div className="legendary-artifact__visual">
        <div className="artifact-aura"></div>
        <div className="artifact-sprite-wrapper">
          {displayedSprite ? (
            <img src={displayedSprite} alt={pokemon.displayName} className="artifact-sprite" />
          ) : (
            <span className="artifact-sprite-placeholder" aria-hidden>
              ?
            </span>
          )}
          <div className="artifact-actions-visual">
            {pokemon.shinySprite && (
              <button
                className={isShiny ? 'artifact-btn shiny is-active' : 'artifact-btn shiny'}
                onClick={() => setIsShiny((value) => !value)}
                type="button"
                title={isShiny ? 'Mostrar normal' : 'Mostrar shiny'}
              >
                <Sparkles size={18} />
              </button>
            )}
            {pokemon.cryUrl && (
              <button className="artifact-btn cry" onClick={onPlayCry} type="button" title="Ouvir cry">
                <Volume2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="legendary-artifact__data">
        <header className="artifact-header">
          <p className="artifact-id">Nº {String(pokemon.id).padStart(4, '0')}</p>
          <h2 className="artifact-name">{pokemon.displayName}</h2>
          <TypeBadges types={pokemon.types} />
        </header>

        <div className="artifact-metrics">
          <dl className="metrics-grid">
            <div>
              <dt>Altura</dt>
              <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div>
              <dt>Peso</dt>
              <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
          </dl>

          <AbilityList abilities={pokemon.abilities} onSelectAbility={onSelectAbility} />
        </div>

        <div className="artifact-stats">
          {Object.entries(pokemon.stats).map(([name, value]) => (
            <StatBar key={name} label={statLabels[name as PokemonStatName]} value={value} />
          ))}
        </div>

        <div className="artifact-controls">
          <button className="primary-action-celestial" type="button" onClick={onAddToTeam}>
            <Plus size={20} />
            Adicionar à Equipe
          </button>
          <button
            className={isFavorite ? 'icon-action-celestial is-favorite' : 'icon-action-celestial'}
            type="button"
            onClick={onToggleFavorite}
          >
            <Heart fill={isFavorite ? 'currentColor' : 'none'} size={20} />
            <span className="sr-only">Favoritar</span>
          </button>
          <button className="icon-action-celestial" type="button">
            <ShieldCheck size={20} />
            <span className="sr-only">Analisar</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function AbilityList({
  abilities,
  onSelectAbility,
}: {
  abilities: Pokemon['abilities']
  onSelectAbility: (abilityName: string) => void
}) {
  return (
    <section className="ability-list" aria-label="Habilidades">
      {abilities.map((ability) => (
        <button key={ability.name} onClick={() => onSelectAbility(ability.name)} type="button">
          {ability.displayName}
          <Info size={13} />
        </button>
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
