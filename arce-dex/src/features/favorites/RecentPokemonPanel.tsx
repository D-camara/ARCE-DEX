import { Clock } from 'lucide-react'
import type { PokemonSummary } from '../../types/pokemon'
import { TypeBadges } from '../../components/pokemon/TypeBadges'

type RecentPokemonPanelProps = {
  pokemon: PokemonSummary[]
  onSelect: (pokemon: PokemonSummary) => void
}

export function RecentPokemonPanel({ onSelect, pokemon }: RecentPokemonPanelProps) {
  return (
    <section className="recent-panel">
      <h2>
        <Clock size={17} />
        Recentes
      </h2>
      <div className="recent-list">
        {pokemon.map((item) => (
          <button className="recent-item" key={item.id} onClick={() => onSelect(item)} type="button">
            <img src={item.imageUrl} alt="" />
            <span>
              <strong>{item.displayName}</strong>
              <small>#{String(item.id).padStart(4, '0')}</small>
              <TypeBadges compact types={item.types} />
            </span>
          </button>
        ))}
        {pokemon.length === 0 && <p className="empty-copy">Nenhum Pokemon recente ainda.</p>}
      </div>
    </section>
  )
}
