import { Clock } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import type { PokemonSummary } from '@/shared/types/pokemon'
import { TypeBadges } from '@/features/pokemon'
import { duration, ease, EmptyHint, layoutTransition } from '@/shared/ui'

type RecentPokemonPanelProps = {
  pokemon: PokemonSummary[]
  onSelect: (pokemon: PokemonSummary) => void
}

export function RecentPokemonPanel({ onSelect, pokemon }: RecentPokemonPanelProps) {
  const order = pokemon.map((item) => item.id).join()
  return (
    <section className="grid gap-2.5 rounded-2xl border border-line bg-panel/70 p-3.5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:flex md:max-h-[520px] md:flex-col">
      <h2 className="m-0 flex items-center gap-2">
        <Clock size={17} />
        Recentes
      </h2>
      {/* Searching a Pokémon again moves it to the top: it slides there, the others shift down,
          and a new one fades in at the top. layoutScroll: this list scrolls on desktop. */}
      <m.div className="relative grid gap-2.5 md:flex-1 md:overflow-y-auto md:pr-1" layoutScroll>
        <AnimatePresence initial={false} mode="popLayout">
          {pokemon.map((item) => (
            <m.button
              animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
              className="flex min-h-[70px] items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:border-gilt/30 hover:bg-gilt/6"
              exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.in } }}
              initial={{ opacity: 0 }}
              key={item.id}
              layout="position"
              // Only order changes slide items (not late-loading details changing their height).
              layoutDependency={order}
              onClick={() => onSelect(item)}
              transition={{ layout: layoutTransition }}
              type="button"
            >
              <img src={item.imageUrl} alt="" className="h-11 w-11 object-contain" />
              <span className="flex flex-col gap-1">
                <strong className="text-[0.98rem] font-bold text-ivory">{item.displayName}</strong>
                <small className="text-xs text-muted">#{String(item.id).padStart(4, '0')}</small>
                <TypeBadges compact types={item.types} />
              </span>
            </m.button>
          ))}
        </AnimatePresence>
        {pokemon.length === 0 && (
          <EmptyHint>Nenhum Pokémon recente ainda.</EmptyHint>
        )}
      </m.div>
    </section>
  )
}
