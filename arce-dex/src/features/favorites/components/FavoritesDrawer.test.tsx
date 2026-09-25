import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PokemonSummary } from '@/shared/types/pokemon'
import { FavoritesDrawer } from './FavoritesDrawer'

const summary = (id: number, displayName: string): PokemonSummary => ({
  id,
  name: displayName.toLowerCase(),
  displayName,
  sprite: '',
  imageUrl: '',
  types: ['dragon'],
})

function Harness({ initial }: { initial: PokemonSummary[] }) {
  const [favorites, setFavorites] = useState(initial)
  return (
    <FavoritesDrawer
      favorites={favorites}
      isOpen
      onClose={() => {}}
      onRemove={(id) => setFavorites((list) => list.filter((pokemon) => pokemon.id !== id))}
      onSelect={() => {}}
    />
  )
}

describe('FavoritesDrawer', () => {
  it('moves focus to the next item after a removal, instead of dropping it', async () => {
    render(<Harness initial={[summary(1, 'Gible'), summary(2, 'Gabite'), summary(3, 'Garchomp')]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remover Gabite dos favoritos' }))

    await waitFor(() => expect(screen.queryByText('Gabite')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Remover Garchomp dos favoritos' })).toHaveFocus()
  })

  it('falls back to the previous item when the last one is removed', async () => {
    render(<Harness initial={[summary(1, 'Gible'), summary(2, 'Gabite')]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remover Gabite dos favoritos' }))

    await waitFor(() => expect(screen.queryByText('Gabite')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Remover Gible dos favoritos' })).toHaveFocus()
  })

  it('focuses the title when the list becomes empty', async () => {
    render(<Harness initial={[summary(1, 'Gible')]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remover Gible dos favoritos' }))

    await waitFor(() => expect(screen.getByText('Nenhum Pokémon favoritado.')).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Pokémon salvos' })).toHaveFocus()
  })
})
