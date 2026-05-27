import { Clock, Star } from 'lucide-react'
import type { PokemonSuggestion } from '../mockPokemonData'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type FavoritesPanelProps = {
  favorites: PokemonSuggestion[]
  history: PokemonSuggestion[]
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
  items: PokemonSuggestion[]
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
          <span>{pokemon.name}</span>
          <TypeBadges compact types={pokemon.types} />
        </div>
      ))}
    </article>
  )
}
