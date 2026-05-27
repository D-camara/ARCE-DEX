export function formatPokemonName(name: string) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function normalizePokemonSearch(value: string): string | number {
  const normalizedValue = value.trim().toLowerCase()
  const numericValue = normalizedValue.replace(/^#/, '')

  if (/^\d+$/.test(numericValue)) {
    return Number(numericValue)
  }

  return normalizedValue
}
