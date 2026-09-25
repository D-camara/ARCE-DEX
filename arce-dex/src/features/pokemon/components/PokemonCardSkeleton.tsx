import { Skeleton } from '@/shared/ui'

/**
 * Same frame as PokemonCard (sprite panel + info column, stacked on phones), so nothing jumps
 * when the real card replaces it.
 */
export function PokemonCardSkeleton() {
  return (
    <article
      role="status"
      aria-label="Carregando Pokémon"
      className="grid grid-cols-1 overflow-hidden rounded-t-3xl border border-parchment/12 bg-ink/70 lg:grid-cols-[minmax(280px,40%)_1fr]"
    >
      <div className="grid place-items-center gap-3 border-b border-parchment/5 p-6 px-4 lg:border-b-0 lg:border-r lg:p-8">
        <Skeleton className="h-[130px] w-[130px] rounded-full lg:h-[240px] lg:w-[240px]" />
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>

      <div className="grid content-start gap-4 p-5 lg:p-6">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[62px] rounded-xl" />
          <Skeleton className="h-[62px] rounded-xl" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>

        <div className="grid gap-3 rounded-2xl border border-parchment/10 bg-panel/50 p-3 px-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="grid grid-cols-[34px_1fr_34px] items-center gap-2">
              <Skeleton className="h-3" />
              <Skeleton className="h-[9px] rounded-full" />
              <Skeleton className="h-3" />
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </div>
    </article>
  )
}
