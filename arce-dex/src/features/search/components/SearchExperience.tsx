import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { ArrowRight, Search, X } from 'lucide-react'
import type { PokemonSummary } from '@/shared/types/pokemon'
import {
  getPokemonAutocompleteSuggestions,
  normalizePokemonSearchText,
} from '@/shared/lib/pokemon-search'
import { TypeBadges } from '@/features/pokemon'
import { duration, ease, EmptyHint, spring } from '@/shared/ui'

type SearchExperienceProps = {
  suggestions: PokemonSummary[]
  value: string
  isLoading: boolean
  isError: boolean
  isAutocompleteOpen: boolean
  onChange: (value: string) => void
  onFocus: () => void
  onClose: () => void
  onSearch: (value: string) => void
  onSelect: (pokemon: PokemonSummary) => void
}

/**
 * Search field + suggestion list, built as an ARIA combobox: arrows move through suggestions,
 * Enter picks the highlighted one (or searches the typed text), Esc / tapping outside closes.
 * On phones the keyboard is dismissed after a pick so the result isn't hidden behind it.
 */
export function SearchExperience({
  isAutocompleteOpen,
  isError,
  isLoading,
  onClose,
  onFocus,
  onSearch,
  suggestions,
  value,
  onChange,
  onSelect,
}: SearchExperienceProps) {
  const listboxId = useId()
  const optionIdPrefix = useId()
  const rootRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // The highlight belongs to the query it was made for: typing resets it to "nothing", so
  // Enter searches what was typed rather than a stale suggestion.
  const [highlight, setHighlight] = useState({ query: '', index: -1 })

  const normalizedValue = normalizePokemonSearchText(value)
  const shouldShowSuggestions = isAutocompleteOpen && normalizedValue.length >= 2
  const visibleSuggestions = shouldShowSuggestions
    ? getPokemonAutocompleteSuggestions(value, suggestions)
    : []
  const activeIndex = highlight.query === normalizedValue ? highlight.index : -1
  const activeSuggestion = visibleSuggestions[activeIndex]
  const setActiveIndex = (index: number) => setHighlight({ query: normalizedValue, index })

  useEffect(() => {
    if (!shouldShowSuggestions) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [shouldShowSuggestions, onClose])

  function pick(pokemon: PokemonSummary) {
    inputRef.current?.blur()
    onSelect(pokemon)
  }

  function submit() {
    if (activeSuggestion) {
      pick(activeSuggestion)
      return
    }
    inputRef.current?.blur()
    onSearch(value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && shouldShowSuggestions) {
      event.preventDefault()
      onClose()
      return
    }

    if (visibleSuggestions.length === 0 || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) {
      return
    }

    event.preventDefault()
    const last = visibleSuggestions.length - 1
    // Cycles through: nothing highlighted (-1) → 0 → … → last → back to nothing.
    const next = activeIndex + (event.key === 'ArrowDown' ? 1 : -1)
    setActiveIndex(next > last ? -1 : next < -1 ? last : next)
  }

  return (
    <section ref={rootRef} className="relative mx-auto w-[min(680px,100%)]">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="flex min-h-11 items-center gap-0.5 rounded-control border border-gold/22 bg-ink/85 pl-3 pr-0.5 transition-colors focus-within:border-gold focus-within:bg-cosmic-soft focus-within:shadow-glow-gold [&:focus-within>svg]:text-gold">
          <Search size={18} className="shrink-0 text-muted transition-colors" aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Buscar Pokémon por nome ou número"
            aria-expanded={shouldShowSuggestions}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeSuggestion ? `${optionIdPrefix}-${activeIndex}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="search"
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            onKeyDown={handleKeyDown}
            placeholder="Nome, número ou #448"
            type="text"
            value={value}
            // The whole field shows focus (gold border + glow via focus-within). The global
            // *:focus-visible outline would draw a second box inside it; inline style beats it.
            style={{ outline: 'none', boxShadow: 'none' }}
            className="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-1 text-ivory outline-none placeholder:text-mist md:text-[0.9rem]"
          />
          {value && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => {
                onChange('')
                inputRef.current?.focus()
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-ivory"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
          <m.button
            whileTap={{ scale: 0.95 }}
            transition={spring.snappy}
            type="submit"
            aria-label="Buscar"
            className="inline-flex h-10 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-gilt/40 bg-gilt/15 px-3 text-[0.8rem] font-bold uppercase tracking-wide text-ivory transition-colors hover:border-gilt/60 hover:bg-gilt/25 pointer-coarse:h-11 max-sm:h-11 max-sm:px-0"
          >
            <ArrowRight size={16} className="sm:hidden" aria-hidden="true" />
            <span className="max-sm:hidden">Buscar</span>
          </m.button>
        </div>
      </form>

      <AnimatePresence>
        {shouldShowSuggestions && (
          <m.div
            key="suggestions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: duration.fast, ease: ease.out } }}
            exit={{ opacity: 0, y: -4, transition: { duration: duration.exit, ease: ease.in } }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[70] max-h-[min(420px,60svh)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border border-azure/28 bg-ink-deep/98 p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            {isLoading && <EmptyHint>Carregando Pokémon...</EmptyHint>}
            {isError && <EmptyHint>Não foi possível carregar a PokeAPI.</EmptyHint>}
            <ul id={listboxId} role="listbox" aria-label="Sugestões" className="grid gap-1">
              {!isLoading &&
                !isError &&
                visibleSuggestions.map((pokemon, index) => (
                  <li
                    id={`${optionIdPrefix}-${index}`}
                    key={pokemon.name}
                    role="option"
                    aria-selected={index === activeIndex}
                    // pointerdown would blur the input first on some mobile browsers; click is fine
                    // because outside-tap closing ignores taps inside this component.
                    onClick={() => pick(pokemon)}
                    onPointerMove={() => setActiveIndex(index)}
                    className={`grid min-h-14 cursor-pointer grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-xl border px-2.5 py-2 transition-colors ${
                      index === activeIndex ? 'border-gold/60 bg-surface-2' : 'border-transparent bg-surface'
                    }`}
                  >
                    {pokemon.imageUrl ? (
                      <img className="h-10 w-10 object-contain" src={pokemon.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="h-10 w-10" aria-hidden="true" />
                    )}
                    <span className="grid min-w-0 gap-1">
                      <span className="flex min-w-0 items-baseline justify-between gap-2">
                        <strong className="truncate font-extrabold leading-tight">{pokemon.displayName}</strong>
                        <small className="shrink-0 text-xs font-bold text-muted">
                          {pokemon.id > 0 ? `#${String(pokemon.id).padStart(4, '0')}` : ''}
                        </small>
                      </span>
                      {pokemon.types.length > 0 && <TypeBadges compact types={pokemon.types} />}
                    </span>
                  </li>
                ))}
            </ul>
            {!isLoading && !isError && visibleSuggestions.length === 0 && (
              <EmptyHint>
                Nenhum Pokémon encontrado para “{value.trim()}”. Tente o número (ex.: 448) ou parte do nome.
              </EmptyHint>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
