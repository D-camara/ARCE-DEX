import type { PokemonTypeName } from '@/shared/types/pokemon'
import { typeBadgeStyle } from '../lib/type-colors'

type TypeBadgesProps = {
  types: PokemonTypeName[]
  compact?: boolean
}

export function TypeBadges({ types, compact = false }: TypeBadgesProps) {
  return (
    <div className="flex w-fit max-w-full flex-wrap gap-[7px]">
      {types.map((type) => (
        <span
          className={
            compact
              ? 'inline-flex min-h-[22px] w-fit max-w-max items-center justify-center whitespace-nowrap rounded-full border border-line bg-surface-2 px-[0.52rem] py-[0.28rem] text-xs font-extrabold uppercase leading-none text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]'
              : 'inline-flex min-h-[28px] w-fit max-w-max items-center justify-center whitespace-nowrap rounded-full border border-line bg-surface-2 px-[0.65rem] py-[0.35rem] text-xs font-extrabold uppercase leading-none text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]'
          }
          key={type}
          style={typeBadgeStyle(type)}
        >
          {type}
        </span>
      ))}
    </div>
  )
}
