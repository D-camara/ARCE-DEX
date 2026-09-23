import { Search } from 'lucide-react'
import type { PokemonSummary } from '@/shared/types/pokemon'
import {
  getPokemonAutocompleteSuggestions,
  normalizePokemonSearchText,
} from '@/shared/lib/pokemon-search'
import { TypeBadges } from '@/features/pokemon'
import { EmptyHint } from '@/shared/ui'

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
    <section className="relative mx-auto w-[min(680px,100%)]">
      <div className="grid w-full grid-cols-1 gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(value)
          }}
        >
          <div className="relative">
            <label className="flex min-h-[38px] items-center gap-2 rounded-[10px] border border-gold/22 bg-ink/85 px-3 transition-colors focus-within:border-gold focus-within:bg-cosmic-soft focus-within:shadow-glow-gold [&:focus-within_svg]:text-gold">
              <Search size={16} className="shrink-0 text-muted transition-colors" />
              <input
                onChange={(event) => onChange(event.target.value)}
                onFocus={onFocus}
                placeholder="Nome, numero ou #448"
                type="search"
                value={value}
                className="min-h-[36px] w-full border-0 bg-transparent text-[0.88rem] text-ivory outline-none placeholder:text-mist"
              />
            </label>
            {shouldShowSuggestions && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[70] flex max-h-[min(360px,calc(100svh-150px))] w-full flex-col gap-2 overflow-y-auto overflow-x-hidden rounded-2xl border border-azure/28 bg-ink-deep/98 p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                {isLoading && <EmptyHint>Carregando Pokemon...</EmptyHint>}
                {isError && <EmptyHint>Nao foi possivel carregar a PokeAPI.</EmptyHint>}
                {!isLoading && !isError && visibleSuggestions.length > 0
                  ? visibleSuggestions.map((pokemon) => (
                      <button
                        className="grid w-full min-h-[92px] grid-cols-[52px_minmax(0,1fr)] items-start gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-surface-2 hover:shadow-glow-gold"
                        key={pokemon.name}
                        onClick={() => onSelect(pokemon)}
                        type="button"
                      >
                        {pokemon.imageUrl ? (
                          <img className="block h-[52px] w-[52px] place-self-center object-contain" src={pokemon.imageUrl} alt="" />
                        ) : (
                          <span className="block h-[52px] w-[52px] place-self-center" aria-hidden />
                        )}
                        <span className="flex w-full min-w-0 flex-col gap-1.5 pt-0.5">
                          <strong className="min-w-0 overflow-hidden truncate font-extrabold leading-tight">
                            {pokemon.displayName}
                          </strong>
                          <small className="text-[0.78rem] font-bold text-muted">
                            {pokemon.id > 0
                              ? `#${String(pokemon.id).padStart(4, '0')}`
                              : pokemon.name}
                          </small>
                          <span className="flex min-w-0 flex-wrap gap-1.5 pt-0.5">
                            <TypeBadges compact types={pokemon.types} />
                          </span>
                        </span>
                      </button>
                    ))
                  : null}
                {!isLoading && !isError && visibleSuggestions.length === 0 ? (
                  <EmptyHint>Nenhum Pokemon encontrado para essa busca.</EmptyHint>
                ) : null}
              </div>
            )}
          </div>
        </form>
        <div className="grid w-full gap-2">
          <button
            type="button"
            onClick={() => onSearch(value)}
            className="flex min-h-[38px] items-center justify-center gap-2 rounded-[10px] border border-gilt/40 bg-[linear-gradient(135deg,rgba(212,175,55,0.15),rgba(246,237,211,0.05))] px-3.5 text-[0.82rem] font-bold uppercase tracking-wide text-ivory shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(212,175,55,0.1)] transition-all hover:border-gilt/60 hover:bg-[linear-gradient(135deg,rgba(212,175,55,0.25),rgba(246,237,211,0.1))] hover:text-white hover:shadow-glow-gold"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>
      </div>
    </section>
  )
}
