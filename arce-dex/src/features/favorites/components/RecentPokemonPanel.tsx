import { Clock } from 'lucide-react'
import type { PokemonSummary } from '@/shared/types/pokemon'
import { TypeBadges } from '@/features/pokemon/components/TypeBadges'

type RecentPokemonPanelProps = {
  pokemon: PokemonSummary[]
  onSelect: (pokemon: PokemonSummary) => void
}

export function RecentPokemonPanel({ onSelect, pokemon }: RecentPokemonPanelProps) {
  return (
    <section className="grid gap-2.5 rounded-2xl border border-line bg-[rgba(18,22,32,0.7)] p-3.5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] min-[760px]:flex min-[760px]:max-h-[520px] min-[760px]:flex-col">
      <h2 className="m-0 flex items-center gap-2">
        <Clock size={17} />
        Recentes
      </h2>
      <div className="grid gap-2.5 min-[760px]:flex-1 min-[760px]:overflow-y-auto min-[760px]:pr-1">
        {pokemon.map((item) => (
          <button
            className="flex min-h-[70px] items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:border-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.06)]"
            key={item.id}
            onClick={() => onSelect(item)}
            type="button"
          >
            <img src={item.imageUrl} alt="" className="h-11 w-11 object-contain" />
            <span className="flex flex-col gap-1">
              <strong className="text-[0.98rem] font-bold text-ivory">{item.displayName}</strong>
              <small className="text-[0.72rem] text-muted">#{String(item.id).padStart(4, '0')}</small>
              <TypeBadges compact types={item.types} />
            </span>
          </button>
        ))}
        {pokemon.length === 0 && (
          <p className="text-center italic tracking-wide text-muted opacity-80">Nenhum Pokemon recente ainda.</p>
        )}
      </div>
    </section>
  )
}
