const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

export async function pokeApiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${POKEAPI_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
