import { create } from 'zustand'

type FavoritesStore = {
  favoritePokemonIds: number[]
  toggleFavorite: (pokemonId: number) => void
  isFavorite: (pokemonId: number) => boolean
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoritePokemonIds: [],
  toggleFavorite: (pokemonId) =>
    set((state) => ({
      favoritePokemonIds: state.favoritePokemonIds.includes(pokemonId)
        ? state.favoritePokemonIds.filter((id) => id !== pokemonId)
        : [...state.favoritePokemonIds, pokemonId],
    })),
  isFavorite: (pokemonId) => get().favoritePokemonIds.includes(pokemonId),
}))
