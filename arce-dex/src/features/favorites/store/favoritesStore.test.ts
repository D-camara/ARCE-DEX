import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from './favoritesStore'

beforeEach(() => {
  useFavoritesStore.setState({ favoritePokemonIds: [] })
})

describe('favoritesStore', () => {
  it('starts with no favorites', () => {
    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([])
  })

  it('adds a pokemon on toggle when not favorited', () => {
    useFavoritesStore.getState().toggleFavorite(25)

    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([25])
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(true)
  })

  it('removes a pokemon on toggle when already favorited', () => {
    useFavoritesStore.getState().toggleFavorite(25)
    useFavoritesStore.getState().toggleFavorite(25)

    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([])
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(false)
  })

  it('tracks multiple favorites independently', () => {
    useFavoritesStore.getState().toggleFavorite(25)
    useFavoritesStore.getState().toggleFavorite(6)

    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([25, 6])
  })
})
