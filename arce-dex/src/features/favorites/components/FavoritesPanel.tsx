import { Clock, Star } from 'lucide-react'
import type { PokemonSummary } from '@/shared/types/pokemon'
import { TypeBadges } from '@/features/pokemon'
import { EmptyHint } from '@/shared/ui'

type FavoritesPanelProps = {
  favorites: PokemonSummary[]
  history: PokemonSummary[]
}

export function FavoritesPanel({ favorites, history }: FavoritesPanelProps) {
  return (
    <section className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
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
    <article className="grid gap-2.5 rounded-2xl border border-line bg-surface-2 p-3.5">
      <h2 className="flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {items.map((pokemon) => (
        <div className="flex min-h-[58px] items-start gap-2.5" key={`${title}-${pokemon.id}`}>
          <img src={pokemon.imageUrl} alt="" className="h-11 w-11 object-contain" />
          <div className="grid min-w-0 flex-1 gap-1">
            <strong>{pokemon.displayName}</strong>
            <small className="text-[0.72rem] text-muted">#{String(pokemon.id).padStart(4, '0')}</small>
            <TypeBadges compact types={pokemon.types} />
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <EmptyHint>Nenhum Pokemon nesta lista.</EmptyHint>
      )}
    </article>
  )
}
