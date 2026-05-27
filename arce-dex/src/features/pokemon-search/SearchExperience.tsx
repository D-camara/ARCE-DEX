import { Search } from 'lucide-react'
import type { PokemonSuggestion } from '../mockPokemonData'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type SearchExperienceProps = {
  suggestions: PokemonSuggestion[]
  value: string
  onChange: (value: string) => void
  onSelect: (pokemon: PokemonSuggestion) => void
}

export function SearchExperience({
  suggestions,
  value,
  onChange,
  onSelect,
}: SearchExperienceProps) {
  const normalizedValue = value.trim().toLowerCase()
  const visibleSuggestions = suggestions.filter((pokemon) =>
    `${pokemon.name} ${pokemon.id}`.toLowerCase().includes(normalizedValue),
  )

  return (
    <section className="search-card">
      <p className="eyebrow">Battle helper mobile</p>
      <h1>Busque, compare e monte seu time sem perder o ritmo.</h1>
      <label className="search-box">
        <Search size={20} />
        <input
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nome, numero ou #448"
          type="search"
          value={value}
        />
      </label>
      <div className="shortcut-grid">
        <span>Buscar Pokemon</span>
        <span>Montar time</span>
        <span>Ver fraquezas</span>
      </div>
      <div className="suggestion-list">
        {visibleSuggestions.length > 0 ? (
          visibleSuggestions.map((pokemon) => (
            <button
              className="suggestion-item"
              key={pokemon.id}
              onClick={() => onSelect(pokemon)}
              type="button"
            >
              <img src={pokemon.imageUrl} alt="" />
              <span>
                <strong>{pokemon.name}</strong>
                <small>#{String(pokemon.id).padStart(4, '0')}</small>
              </span>
              <TypeBadges compact types={pokemon.types} />
            </button>
          ))
        ) : (
          <p className="empty-copy">Nenhum mock encontrado para essa busca.</p>
        )}
      </div>
    </section>
  )
}
