import { Search } from 'lucide-react'
import type { PokemonSummary } from '../../types/pokemon'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type SearchExperienceProps = {
  suggestions: PokemonSummary[]
  value: string
  isLoading: boolean
  isError: boolean
  isAutocompleteOpen: boolean
  canViewWeaknesses: boolean
  onChange: (value: string) => void
  onFocus: () => void
  onMountTeam: () => void
  onSearch: (value: string) => void
  onSelect: (pokemon: PokemonSummary) => void
  onViewWeaknesses: () => void
}

export function SearchExperience({
  canViewWeaknesses,
  isAutocompleteOpen,
  isError,
  isLoading,
  onFocus,
  onMountTeam,
  onSearch,
  onViewWeaknesses,
  suggestions,
  value,
  onChange,
  onSelect,
}: SearchExperienceProps) {
  const normalizedValue = value.trim().toLowerCase()
  const numericValue = normalizedValue.replace(/^#/, '')
  const shouldShowSuggestions = isAutocompleteOpen && normalizedValue.length >= 2
  const visibleSuggestions = shouldShowSuggestions
    ? suggestions
        .filter((pokemon) => {
          const searchableName = `${pokemon.name} ${pokemon.displayName}`.toLowerCase()
          const pokemonId = String(pokemon.id)
          const paddedPokemonId = pokemonId.padStart(3, '0')

          if (/^\d+$/.test(numericValue)) {
            return pokemonId.includes(numericValue) || paddedPokemonId.includes(numericValue)
          }

          return searchableName.includes(normalizedValue)
        })
        .slice(0, 8)
    : []

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
            onFocus={onFocus}
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
        <button type="button" onClick={onMountTeam}>
          Montar time
        </button>
        <button type="button" onClick={onViewWeaknesses} disabled={!canViewWeaknesses}>
          Ver fraquezas
        </button>
      </div>
      {shouldShowSuggestions && (
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
      )}
    </section>
  )
}
