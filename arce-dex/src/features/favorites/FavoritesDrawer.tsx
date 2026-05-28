import { HeartOff, X } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { PokemonSummary } from '../../types/pokemon'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type FavoritesDrawerProps = {
  isOpen: boolean
  favorites: PokemonSummary[]
  onClose: () => void
  onRemove: (pokemonId: number) => void
  onSelect: (pokemon: PokemonSummary) => void
}

export function FavoritesDrawer({
  favorites,
  isOpen,
  onClose,
  onRemove,
  onSelect,
}: FavoritesDrawerProps) {
  function handleRemove(event: MouseEvent<HTMLButtonElement>, pokemonId: number) {
    event.stopPropagation()
    onRemove(pokemonId)
  }

  return (
    <aside className={isOpen ? 'favorites-drawer is-open' : 'favorites-drawer'} aria-hidden={!isOpen}>
      <header>
        <div>
          <p className="eyebrow">Favoritos</p>
          <h2>Pokemon salvos</h2>
        </div>
        <button className="icon-action" type="button" onClick={onClose}>
          <X size={18} />
          <span className="sr-only">Fechar favoritos</span>
        </button>
      </header>

      <div className="favorite-list">
        {favorites.map((pokemon) => (
          <article
            className="favorite-card"
            key={pokemon.id}
            onClick={() => onSelect(pokemon)}
            role="button"
            tabIndex={0}
          >
            <img className="favorite-card__sprite" src={pokemon.imageUrl} alt="" />
            <div className="favorite-card__content">
              <strong className="favorite-card__name">{pokemon.displayName}</strong>
              <span className="favorite-card__number">
                #{String(pokemon.id).padStart(4, '0')}
              </span>
              <TypeBadges compact types={pokemon.types} />
            </div>
            <button
              className="favorite-card__remove"
              type="button"
              onClick={(event) => handleRemove(event, pokemon.id)}
            >
              <HeartOff size={16} />
              <span className="sr-only">Remover favorito</span>
            </button>
          </article>
        ))}
        {favorites.length === 0 && <p className="empty-copy">Nenhum Pokemon favoritado.</p>}
      </div>
    </aside>
  )
}
