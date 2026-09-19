import type { CSSProperties } from 'react'
import type { PokemonTypeName } from '@/shared/types/pokemon'

const TYPE_COLORS: Record<PokemonTypeName, { border: string; background: string; shadow: string; color?: string }> = {
  normal: { border: 'rgba(168, 167, 122, 0.5)', background: 'rgba(168, 167, 122, 0.15)', shadow: '0 0 12px rgba(168, 167, 122, 0.2)' },
  fire: { border: 'rgba(238, 129, 48, 0.5)', background: 'rgba(238, 129, 48, 0.15)', shadow: '0 0 12px rgba(238, 129, 48, 0.2)' },
  water: { border: 'rgba(99, 144, 240, 0.5)', background: 'rgba(99, 144, 240, 0.15)', shadow: '0 0 12px rgba(99, 144, 240, 0.2)' },
  electric: { border: 'rgba(247, 208, 44, 0.5)', background: 'rgba(247, 208, 44, 0.15)', shadow: '0 0 12px rgba(247, 208, 44, 0.2)', color: '#fde68a' },
  grass: { border: 'rgba(122, 199, 76, 0.5)', background: 'rgba(122, 199, 76, 0.15)', shadow: '0 0 12px rgba(122, 199, 76, 0.2)' },
  ice: { border: 'rgba(150, 217, 214, 0.5)', background: 'rgba(150, 217, 214, 0.15)', shadow: '0 0 12px rgba(150, 217, 214, 0.2)', color: '#cffafe' },
  fighting: { border: 'rgba(194, 46, 40, 0.5)', background: 'rgba(194, 46, 40, 0.15)', shadow: '0 0 12px rgba(194, 46, 40, 0.2)' },
  poison: { border: 'rgba(163, 62, 161, 0.5)', background: 'rgba(163, 62, 161, 0.15)', shadow: '0 0 12px rgba(163, 62, 161, 0.2)' },
  ground: { border: 'rgba(226, 191, 101, 0.5)', background: 'rgba(226, 191, 101, 0.15)', shadow: '0 0 12px rgba(226, 191, 101, 0.2)' },
  flying: { border: 'rgba(169, 143, 243, 0.5)', background: 'rgba(169, 143, 243, 0.15)', shadow: '0 0 12px rgba(169, 143, 243, 0.2)' },
  psychic: { border: 'rgba(249, 85, 135, 0.5)', background: 'rgba(249, 85, 135, 0.15)', shadow: '0 0 12px rgba(249, 85, 135, 0.2)' },
  bug: { border: 'rgba(166, 185, 26, 0.5)', background: 'rgba(166, 185, 26, 0.15)', shadow: '0 0 12px rgba(166, 185, 26, 0.2)' },
  rock: { border: 'rgba(182, 161, 54, 0.5)', background: 'rgba(182, 161, 54, 0.15)', shadow: '0 0 12px rgba(182, 161, 54, 0.2)' },
  ghost: { border: 'rgba(115, 87, 151, 0.5)', background: 'rgba(115, 87, 151, 0.15)', shadow: '0 0 12px rgba(115, 87, 151, 0.2)' },
  dragon: { border: 'rgba(111, 53, 252, 0.5)', background: 'rgba(111, 53, 252, 0.15)', shadow: '0 0 12px rgba(111, 53, 252, 0.2)' },
  dark: { border: 'rgba(112, 87, 70, 0.5)', background: 'rgba(112, 87, 70, 0.15)', shadow: '0 0 12px rgba(112, 87, 70, 0.2)' },
  steel: { border: 'rgba(183, 183, 206, 0.5)', background: 'rgba(183, 183, 206, 0.15)', shadow: '0 0 12px rgba(183, 183, 206, 0.2)' },
  fairy: { border: 'rgba(214, 133, 173, 0.5)', background: 'rgba(214, 133, 173, 0.15)', shadow: '0 0 12px rgba(214, 133, 173, 0.2)' },
}

export function typeBadgeStyle(type: PokemonTypeName): CSSProperties {
  const colors = TYPE_COLORS[type]

  return {
    borderColor: colors.border,
    backgroundColor: colors.background,
    boxShadow: colors.shadow,
    color: colors.color,
  }
}
