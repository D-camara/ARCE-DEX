import { useState } from 'react'
import type { PokemonTabName } from '@/features/pokemon'

export function useAppView() {
  const [activeView, setActiveView] = useState<'dex' | 'team-lab'>('dex')
  const [activePokemonTab, setActivePokemonTab] = useState<PokemonTabName>('Info')
  const [query, setQuery] = useState('')
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | number>(448)
  const [selectedAbilityName, setSelectedAbilityName] = useState<string | null>(null)

  return {
    activeView,
    setActiveView,
    activePokemonTab,
    setActivePokemonTab,
    query,
    setQuery,
    isAutocompleteOpen,
    setIsAutocompleteOpen,
    selectedIdentifier,
    setSelectedIdentifier,
    selectedAbilityName,
    setSelectedAbilityName,
  }
}
