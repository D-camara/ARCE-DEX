import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export { resolvePokemonSearchInput as normalizePokemonSearch } from '@/shared/lib/pokemon-search'

/** Merges class names, letting later Tailwind utilities win (shadcn/21st components rely on it). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPokemonName(name: string) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatGenerationName(name: string) {
  const [label, roman] = name.split('-')

  if (label === 'generation' && roman) {
    return `Generation ${roman.toUpperCase()}`
  }

  return formatPokemonName(name)
}
