import { Clock, Star } from 'lucide-react'
import type { PokemonSummary } from '../../types/pokemon'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type FavoritesPanelProps = {
  favorites: PokemonSummary[]
  history: PokemonSummary[]
}

export function FavoritesPanel({ favorites, history }: FavoritesPanelProps) {
  return (
    <section className="quick-panel">
      <QuickList icon={<Star size={17} />} items={favorites} title="Favoritos" />
      <QuickList icon={<Clock size={17} />} items={history} title="Recentes" />
    </section>
  )
}

function QuickList({
  icon,
  items,
  title,
}: {
  icon: React.ReactNode
  items: PokemonSummary[]
  title: string
}) {
  return (
    <article>
      <h2>
        {icon}
        {title}
      </h2>
      {items.map((pokemon) => (
        <div className="quick-pokemon" key={`${title}-${pokemon.id}`}>
          <img src={pokemon.imageUrl} alt="" />
          <div>
            <strong>{pokemon.displayName}</strong>
            <small>#{String(pokemon.id).padStart(4, '0')}</small>
            <TypeBadges compact types={pokemon.types} />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="empty-copy">Nenhum Pokemon nesta lista.</p>}
    </article>
  )
}
