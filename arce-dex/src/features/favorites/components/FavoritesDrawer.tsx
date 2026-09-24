import { HeartOff } from 'lucide-react'
import { useId, useRef, type MouseEvent } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { CloseButton, duration, ease, useDialogBehavior } from '@/shared/ui'
import type { PokemonSummary } from '@/shared/types/pokemon'
import { TypeBadges } from '@/features/pokemon'

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
  const drawerRef = useRef<HTMLElement>(null)
  const titleId = useId()
  useDialogBehavior(isOpen, onClose, drawerRef)

  function handleRemove(event: MouseEvent<HTMLButtonElement>, pokemonId: number) {
    event.stopPropagation()
    onRemove(pokemonId)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="favorites-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
            exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.in } }}
            className="fixed inset-0 z-[1000] bg-abyss/70 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <aside
        className={`fixed right-0 top-0 z-[1001] grid h-[100svh] w-full max-w-[calc(100vw-20px)] grid-rows-[auto_1fr] gap-3.5 overflow-hidden border-l border-parchment/12 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_22rem),linear-gradient(180deg,rgba(13,18,34,0.99),rgba(5,9,18,0.99))] p-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-transform duration-300 md:w-[420px] md:max-w-[420px] ${
          isOpen ? 'translate-x-0' : 'translate-x-[105%]'
        }`}
        ref={drawerRef}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        // Off-screen while closed: keep it out of the Tab order too.
        inert={!isOpen}
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-gold">Favoritos</p>
            <h2 id={titleId}>Pokemon salvos</h2>
          </div>
          <CloseButton label="Fechar favoritos" onClick={onClose} tone="gold" />
        </header>

        <div className="grid min-h-0 gap-2.5 overflow-y-auto">
          {favorites.map((pokemon) => (
            <article
              className="grid w-full min-h-[82px] cursor-pointer grid-cols-[50px_minmax(0,1fr)_44px] items-center gap-3 rounded-2xl border border-gilt-warm/24 bg-[linear-gradient(135deg,rgba(245,208,108,0.09),rgba(103,232,249,0.04)),rgba(15,23,42,0.84)] p-3 transition-colors hover:border-gilt-warm/50 hover:bg-[linear-gradient(135deg,rgba(245,208,108,0.14),rgba(103,232,249,0.06)),rgba(15,23,42,0.92)]"
              key={pokemon.id}
              onClick={() => onSelect(pokemon)}
              role="button"
              tabIndex={0}
            >
              <img className="h-[54px] w-[54px] object-contain" src={pokemon.imageUrl} alt="" />
              <div className="grid min-w-0 gap-1">
                <strong className="[overflow-wrap:anywhere] leading-tight">{pokemon.displayName}</strong>
                <span className="text-[0.76rem] font-extrabold text-muted">
                  #{String(pokemon.id).padStart(4, '0')}
                </span>
                <TypeBadges compact types={pokemon.types} />
              </div>
              <button
                className="inline-grid h-11 w-11 place-items-center rounded-control border border-danger-400/30 bg-danger-400/8 text-danger-300"
                type="button"
                onClick={(event) => handleRemove(event, pokemon.id)}
              >
                <HeartOff size={16} />
                <span className="sr-only">Remover favorito</span>
              </button>
            </article>
          ))}
          {favorites.length === 0 && (
            <p className="flex min-h-[200px] items-center justify-center p-10 text-center text-[0.95rem] text-muted">
              Nenhum Pokemon favoritado.
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
