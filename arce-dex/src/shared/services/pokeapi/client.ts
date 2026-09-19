const DEFAULT_POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

const pokeApiBaseUrl = (
  import.meta.env.VITE_POKEAPI_BASE_URL ?? DEFAULT_POKEAPI_BASE_URL
).replace(/\/$/, '')

function buildPokeApiUrl(path: string) {
  if (path.startsWith('http')) {
    return path
  }

  return `${pokeApiBaseUrl}/${path.replace(/^\//, '')}`
}

export async function pokeApiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildPokeApiUrl(path))

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
