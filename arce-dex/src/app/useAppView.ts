import { useCallback, useState } from 'react'
import type { PokemonTabName } from '@/features/pokemon'
import { useUrlState } from './useUrlState'
import type { AppViewName } from './urlState'

export function useAppView() {
  const { state: urlState, update: updateUrlState } = useUrlState()
  const [query, setQuery] = useState('')
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [selectedAbilityName, setSelectedAbilityName] = useState<string | null>(null)

  // Pokémon and view changes are navigation (back button undoes them); tab changes aren't.
  const setActiveView = useCallback(
    (view: AppViewName) => updateUrlState({ view }, 'push'),
    [updateUrlState],
  )
  const setActivePokemonTab = useCallback(
    (tab: PokemonTabName) => updateUrlState({ tab }, 'replace'),
    [updateUrlState],
  )
  const setSelectedIdentifier = useCallback(
    (pokemon: string | number) => updateUrlState({ pokemon }, 'push'),
    [updateUrlState],
  )
  /** Canonicalize (e.g. id → name) without adding a history entry. */
  const replaceSelectedIdentifier = useCallback(
    (pokemon: string | number) => updateUrlState({ pokemon }, 'replace'),
    [updateUrlState],
  )

  return {
    activeView: urlState.view,
    setActiveView,
    activePokemonTab: urlState.tab,
    setActivePokemonTab,
    query,
    setQuery,
    isAutocompleteOpen,
    setIsAutocompleteOpen,
    selectedIdentifier: urlState.pokemon,
    setSelectedIdentifier,
    replaceSelectedIdentifier,
    selectedAbilityName,
    setSelectedAbilityName,
  }
}
