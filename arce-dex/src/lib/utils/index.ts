export { resolvePokemonSearchInput as normalizePokemonSearch } from '../search'

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
