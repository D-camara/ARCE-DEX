import { useEffect } from 'react'
import type { Pokemon } from '@/shared/types/pokemon'
import type { useAppView } from './useAppView'
import { DEFAULT_URL_STATE } from './urlState'

const APP_TITLE = 'Archivum Arceus'

/**
 * Once the selected Pokémon loads, rewrite `?pokemon=445` (or an alias) to its canonical name
 * without a new history entry, and name the tab after it so shared links/bookmarks read well.
 */
export function useCanonicalPokemonUrl(view: ReturnType<typeof useAppView>, selectedPokemon: Pokemon | undefined) {
  const { selectedIdentifier, replaceSelectedIdentifier, activeView } = view

  useEffect(() => {
    // The default Pokémon stays implicit so the plain app URL stays clean.
    const isDefault = selectedIdentifier === DEFAULT_URL_STATE.pokemon
    if (selectedPokemon && !isDefault && selectedIdentifier !== selectedPokemon.name) {
      replaceSelectedIdentifier(selectedPokemon.name)
    }
  }, [selectedPokemon, selectedIdentifier, replaceSelectedIdentifier])

  useEffect(() => {
    document.title =
      activeView === 'dex' && selectedPokemon ? `${selectedPokemon.displayName} · ${APP_TITLE}` : APP_TITLE
  }, [activeView, selectedPokemon])
}
