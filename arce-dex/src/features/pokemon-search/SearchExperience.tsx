import { Search } from 'lucide-react'
import type { PokemonSummary } from '../../types/pokemon'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type SearchExperienceProps = {
  suggestions: PokemonSummary[]
  value: string
  isLoading: boolean
  isError: boolean
  onChange: (value: string) => void
  onSearch: (value: string) => void
  onSelect: (pokemon: PokemonSummary) => void
}

export function SearchExperience({
  isError,
  isLoading,
  onSearch,
  suggestions,
  value,
  onChange,
  onSelect,
}: SearchExperienceProps) {
  const normalizedValue = value.trim().toLowerCase()
  const visibleSuggestions = suggestions.filter((pokemon) =>
    `${pokemon.name} ${pokemon.displayName} ${pokemon.id}`.toLowerCase().includes(normalizedValue),
  )

  return (
    <section className="search-card">
      <p className="eyebrow">Battle helper mobile</p>
      <h1>Busque, compare e monte seu time sem perder o ritmo.</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSearch(value)
        }}
      >
        <label className="search-box">
          <Search size={20} />
          <input
            onChange={(event) => onChange(event.target.value)}
            placeholder="Nome, numero ou #448"
            type="search"
            value={value}
          />
        </label>
      </form>
      <div className="shortcut-grid">
        <button type="button" onClick={() => onSearch(value)}>
          Buscar Pokemon
        </button>
        <span>Montar time</span>
        <span>Ver fraquezas</span>
      </div>
      <div className="suggestion-list">
        {isLoading && <p className="empty-copy">Carregando Pokemon...</p>}
        {isError && <p className="empty-copy">Nao foi possivel carregar a PokeAPI.</p>}
        {!isLoading && !isError && visibleSuggestions.length > 0 ? (
          visibleSuggestions.map((pokemon) => (
            <button
              className="suggestion-item"
              key={pokemon.id}
              onClick={() => onSelect(pokemon)}
              type="button"
            >
              <img src={pokemon.imageUrl} alt="" />
              <span>
                <strong>{pokemon.displayName}</strong>
                <small>#{String(pokemon.id).padStart(4, '0')}</small>
              </span>
              <TypeBadges compact types={pokemon.types} />
            </button>
          ))
        ) : null}
        {!isLoading && !isError && visibleSuggestions.length === 0 ? (
          <p className="empty-copy">Nenhum Pokemon encontrado para essa busca.</p>
        ) : null}
      </div>
    </section>
  )
}
