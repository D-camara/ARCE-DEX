import { HeartOff, X } from 'lucide-react'
import type { MouseEvent } from 'react'
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
  function handleRemove(event: MouseEvent<HTMLButtonElement>, pokemonId: number) {
    event.stopPropagation()
    onRemove(pokemonId)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] animate-[fade-in-backdrop_0.24s_ease_forwards] bg-[rgba(2,6,23,0.7)] backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-[1001] grid h-[100svh] w-full max-w-[calc(100vw-20px)] grid-rows-[auto_1fr] gap-3.5 overflow-hidden border-l border-[rgba(246,237,211,0.12)] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_22rem),linear-gradient(180deg,rgba(13,18,34,0.99),rgba(5,9,18,0.99))] p-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-transform duration-300 min-[760px]:w-[420px] min-[760px]:max-w-[420px] ${
          isOpen ? 'translate-x-0' : 'translate-x-[105%]'
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-gold">Favoritos</p>
            <h2>Pokemon salvos</h2>
          </div>
          <button
            className="inline-grid h-[42px] w-[42px] place-items-center rounded-control border border-[rgba(245,208,108,0.26)] bg-white/5"
            type="button"
            onClick={onClose}
          >
            <X size={18} />
            <span className="sr-only">Fechar favoritos</span>
          </button>
        </header>

        <div className="grid min-h-0 gap-2.5 overflow-y-auto">
          {favorites.map((pokemon) => (
            <article
              className="grid w-full min-h-[82px] cursor-pointer grid-cols-[50px_minmax(0,1fr)_44px] items-center gap-3 rounded-2xl border border-[rgba(245,208,108,0.24)] bg-[linear-gradient(135deg,rgba(245,208,108,0.09),rgba(103,232,249,0.04)),rgba(15,23,42,0.84)] p-3 transition-colors hover:border-[rgba(245,208,108,0.5)] hover:bg-[linear-gradient(135deg,rgba(245,208,108,0.14),rgba(103,232,249,0.06)),rgba(15,23,42,0.92)]"
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
                className="inline-grid h-11 w-11 place-items-center rounded-control border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#fca5a5]"
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
