import { HeartOff, X } from 'lucide-react'
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
          <article className="favorite-item" key={pokemon.id}>
            <button type="button" onClick={() => onSelect(pokemon)}>
              <img src={pokemon.imageUrl} alt="" />
              <span>
                <strong>{pokemon.displayName}</strong>
                <small>#{String(pokemon.id).padStart(4, '0')}</small>
                <TypeBadges compact types={pokemon.types} />
              </span>
            </button>
            <button className="icon-action" type="button" onClick={() => onRemove(pokemon.id)}>
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
