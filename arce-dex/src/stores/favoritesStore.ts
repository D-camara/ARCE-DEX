import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createLocalForageStateStorage } from '../lib/storage'

type FavoritesStore = {
  favoritePokemonIds: number[]
  toggleFavorite: (pokemonId: number) => void
  isFavorite: (pokemonId: number) => boolean
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoritePokemonIds: [],
      toggleFavorite: (pokemonId) =>
        set((state) => ({
          favoritePokemonIds: state.favoritePokemonIds.includes(pokemonId)
            ? state.favoritePokemonIds.filter((id) => id !== pokemonId)
            : [...state.favoritePokemonIds, pokemonId],
        })),
      isFavorite: (pokemonId) => get().favoritePokemonIds.includes(pokemonId),
    }),
    {
      name: 'arce-dex:favorites-store',
      storage: createJSONStorage(() => createLocalForageStateStorage()),
    },
  ),
)
