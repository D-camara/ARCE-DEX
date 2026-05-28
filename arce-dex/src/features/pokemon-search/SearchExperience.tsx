import { Search } from 'lucide-react'
import type { PokemonSummary } from '../../types/pokemon'
import {
  getPokemonAutocompleteSuggestions,
  normalizePokemonSearchText,
} from '../../lib/search'

type SearchExperienceProps = {
  suggestions: PokemonSummary[]
  value: string
  isLoading: boolean
  isError: boolean
  isAutocompleteOpen: boolean
  onChange: (value: string) => void
  onFocus: () => void
  onSearch: (value: string) => void
  onSelect: (pokemon: PokemonSummary) => void
}

export function SearchExperience({
  isAutocompleteOpen,
  isError,
  isLoading,
  onFocus,
  onSearch,
  suggestions,
  value,
  onChange,
  onSelect,
}: SearchExperienceProps) {
  const normalizedValue = normalizePokemonSearchText(value)
  const shouldShowSuggestions = isAutocompleteOpen && normalizedValue.length >= 2
  const visibleSuggestions = shouldShowSuggestions
    ? getPokemonAutocompleteSuggestions(value, suggestions)
    : []

  return (
    <section className="search-card">
      <div className="search-card__inner">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(value)
          }}
        >
          <div className="search-field-shell">
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
            {shouldShowSuggestions && (
              <div className="search-dropdown">
                {isLoading && <p className="empty-copy">Carregando Pokemon...</p>}
                {isError && <p className="empty-copy">Nao foi possivel carregar a PokeAPI.</p>}
                {!isLoading && !isError && visibleSuggestions.length > 0 ? (
                  visibleSuggestions.map((pokemon) => (
                    <button
                      className="search-result-item"
                      key={pokemon.name}
                      onClick={() => onSelect(pokemon)}
                      type="button"
                    >
                      {pokemon.imageUrl ? (
                        <img className="search-result-item__sprite" src={pokemon.imageUrl} alt="" />
                      ) : (
                        <span className="search-result-item__sprite" aria-hidden />
                      )}
                      <span className="search-result-item__content">
                        <strong className="search-result-item__name">{pokemon.displayName}</strong>
                        <small className="search-result-item__number">
                          {pokemon.id > 0
                            ? `#${String(pokemon.id).padStart(4, '0')}`
                            : pokemon.name}
                        </small>
                        <span className="search-result-item__types">
                          {pokemon.types.map((type) => (
                            <span className={`type-badge type-${type}`} key={type}>
                              {type}
                            </span>
                          ))}
                        </span>
                      </span>
                    </button>
                  ))
                ) : null}
                {!isLoading && !isError && visibleSuggestions.length === 0 ? (
                  <p className="empty-copy">Nenhum Pokemon encontrado para essa busca.</p>
                ) : null}
              </div>
            )}
          </div>
        </form>
        <div className="shortcut-grid">
          <button type="button" onClick={() => onSearch(value)}>
            Buscar Pokemon
          </button>
        </div>
      </div>
    </section>
  )
}
