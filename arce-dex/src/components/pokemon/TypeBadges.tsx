import type { PokemonTypeName } from '../../types/pokemon'

type TypeBadgesProps = {
  types: PokemonTypeName[]
  compact?: boolean
}

export function TypeBadges({ types, compact = false }: TypeBadgesProps) {
  return (
    <div className={compact ? 'type-badges type-badges--compact' : 'type-badges'}>
      {types.map((type) => (
        <span className={`type-badge type-${type}`} key={type}>
          {type}
        </span>
      ))}
    </div>
  )
}
