import type { PokemonSummary } from '../../types/pokemon'

export type PokemonSearchValue = string | number

export type PokemonSearchAlias = {
  label: string
  pokemonName: string
  aliases: string[]
}

const REGION_ALIASES: Record<string, string> = {
  alolan: 'alola',
  alola: 'alola',
  galarian: 'galar',
  galar: 'galar',
  hisuian: 'hisui',
  hisui: 'hisui',
  paldean: 'paldea',
  paldea: 'paldea',
}

export const POKEMON_SEARCH_ALIASES: PokemonSearchAlias[] = [
  createAlias('Toxtricity', 'toxtricity-amped', ['toxtricity']),
  createAlias('Toxtricity Amped', 'toxtricity-amped', [
    'toxtricity amped',
    'amped toxtricity',
    'toxtricity amped form',
    'amped form toxtricity',
  ]),
  createAlias('Toxtricity Low Key', 'toxtricity-low-key', [
    'toxtricity low key',
    'toxtricity low-key',
    'low key toxtricity',
    'low-key toxtricity',
    'toxtricity low key form',
    'low key form toxtricity',
  ]),
  createAlias('Toxtricity G-Max Amped', 'toxtricity-amped-gmax', [
    'gmax toxtricity',
    'g-max toxtricity',
    'gigantamax toxtricity',
    'toxtricity gmax',
    'toxtricity g-max',
    'toxtricity gigantamax',
    'gmax toxtricity amped',
    'gigantamax toxtricity amped',
    'toxtricity amped gmax',
  ]),
  createAlias('Toxtricity G-Max Low Key', 'toxtricity-low-key-gmax', [
    'gmax toxtricity low key',
    'g-max toxtricity low key',
    'gigantamax toxtricity low key',
    'toxtricity low key gmax',
    'toxtricity low-key gmax',
    'low key toxtricity gmax',
  ]),
  createAlias('Charizard Mega X', 'charizard-mega-x', [
    'mega charizard x',
    'charizard mega x',
    'charizard x mega',
  ]),
  createAlias('Charizard Mega Y', 'charizard-mega-y', [
    'mega charizard y',
    'charizard mega y',
    'charizard y mega',
  ]),
  createAlias('Lucario Mega', 'lucario-mega', ['mega lucario', 'lucario mega']),
  createAlias('Gengar Mega', 'gengar-mega', ['mega gengar', 'gengar mega']),
  createAlias('Venusaur Mega', 'venusaur-mega', ['mega venusaur', 'venusaur mega']),
  createAlias('Charizard G-Max', 'charizard-gmax', [
    'gmax charizard',
    'g-max charizard',
    'gigantamax charizard',
    'charizard gmax',
    'charizard g-max',
    'charizard gigantamax',
  ]),
  createAlias('Gengar G-Max', 'gengar-gmax', [
    'gmax gengar',
    'g-max gengar',
    'gigantamax gengar',
    'gengar gmax',
    'gengar g-max',
    'gengar gigantamax',
  ]),
  createAlias('Lapras G-Max', 'lapras-gmax', [
    'gmax lapras',
    'g-max lapras',
    'gigantamax lapras',
    'lapras gmax',
    'lapras g-max',
    'lapras gigantamax',
  ]),
  createAlias('Raichu Alola', 'raichu-alola', [
    'alolan raichu',
    'raichu alola',
    'raichu-alola',
  ]),
  createAlias('Zoroark Hisui', 'zoroark-hisui', [
    'hisuian zoroark',
    'zoroark hisui',
    'zoroark-hisui',
  ]),
  createAlias('Slowbro Galar', 'slowbro-galar', [
    'galarian slowbro',
    'slowbro galar',
    'slowbro-galar',
  ]),
  createAlias('Tauros Paldea Combat', 'tauros-paldea-combat-breed', [
    'paldean tauros',
    'tauros paldea',
    'tauros-paldea',
  ]),
  createAlias('Tauros Paldea Combat', 'tauros-paldea-combat-breed', [
    'paldean tauros combat',
    'tauros paldea combat',
    'tauros combat paldea',
  ]),
  createAlias('Tauros Paldea Blaze', 'tauros-paldea-blaze-breed', [
    'paldean tauros blaze',
    'tauros paldea blaze',
    'tauros blaze paldea',
  ]),
  createAlias('Tauros Paldea Aqua', 'tauros-paldea-aqua-breed', [
    'paldean tauros aqua',
    'tauros paldea aqua',
    'tauros aqua paldea',
  ]),
  createAlias('Mr Mime', 'mr-mime', ['mr mime']),
  createAlias('Mime Jr', 'mime-jr', ['mime jr']),
  createAlias('Porygon Z', 'porygon-z', ['porygon z']),
  createAlias('Ho Oh', 'ho-oh', ['ho oh']),
  createAlias('Jangmo O', 'jangmo-o', ['jangmo o']),
  createAlias('Hakamo O', 'hakamo-o', ['hakamo o']),
  createAlias('Kommo O', 'kommo-o', ['kommo o']),
]

function createAlias(
  label: string,
  pokemonName: string,
  aliases: string[],
): PokemonSearchAlias {
  const normalizedPokemonName = normalizePokemonSearchText(pokemonName)

  return {
    label,
    pokemonName,
    aliases: uniqueStrings([
      normalizedPokemonName,
      normalizedPokemonName.replaceAll('-', ' '),
      ...aliases.map(normalizePokemonSearchText),
    ]),
  }
}

export function normalizePokemonSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^#+\s*/, '')
    .replace(/#/g, '')
    .replace(/g\s*-\s*max/g, 'gmax')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolvePokemonSearchInput(input: string): PokemonSearchValue | '' {
  return getPokemonSearchCandidates(input)[0] ?? ''
}

export function getPokemonSearchCandidates(input: string): PokemonSearchValue[] {
  const normalizedInput = normalizePokemonSearchText(input)

  if (!normalizedInput) {
    return []
  }

  if (/^\d+$/.test(normalizedInput)) {
    return [Number(normalizedInput)]
  }

  const candidates = [
    ...getExactAliasCandidates(normalizedInput),
    ...getPatternCandidates(normalizedInput),
    hyphenatePokemonName(normalizedInput),
    normalizedInput,
  ]

  return uniqueSearchValues(candidates)
}

export function getPokemonAutocompleteSuggestions(
  input: string,
  summaries: PokemonSummary[],
  maxItems = 8,
): PokemonSummary[] {
  const normalizedInput = normalizePokemonSearchText(input)

  if (normalizedInput.length < 2) {
    return []
  }

  const byName = new Map(summaries.map((pokemon) => [pokemon.name, pokemon]))
  const byId = new Map(summaries.map((pokemon) => [pokemon.id, pokemon]))
  const aliasMatches = getMatchingAliases(normalizedInput)
    .map((alias) => byName.get(alias.pokemonName) ?? createAliasSummary(alias))
    .filter((pokemon): pokemon is PokemonSummary => Boolean(pokemon))

  const numericInput = normalizedInput.replace(/^0+/, '') || '0'
  const listMatches = summaries.filter((pokemon) => {
    const searchableNames = [
      pokemon.name,
      pokemon.displayName,
      pokemon.name.replaceAll('-', ' '),
    ]
      .map(normalizePokemonSearchText)
      .join(' ')

    if (/^\d+$/.test(normalizedInput)) {
      const pokemonId = String(pokemon.id)
      const paddedPokemonId = pokemonId.padStart(3, '0')

      return pokemonId === numericInput || paddedPokemonId.includes(normalizedInput)
    }

    return searchableNames.includes(normalizedInput)
  })

  const candidateMatches = getPokemonSearchCandidates(input)
    .map((candidate) =>
      typeof candidate === 'number' ? byId.get(candidate) : byName.get(candidate),
    )
    .filter((pokemon): pokemon is PokemonSummary => Boolean(pokemon))

  return uniquePokemonSummaries([...aliasMatches, ...candidateMatches, ...listMatches])
    .sort((left, right) => getSortableDexNumber(left) - getSortableDexNumber(right))
    .slice(0, maxItems)
}

function getSortableDexNumber(pokemon: PokemonSummary): number {
  return pokemon.id > 0 ? pokemon.id : Number.MAX_SAFE_INTEGER
}

function getExactAliasCandidates(normalizedInput: string): string[] {
  return POKEMON_SEARCH_ALIASES.filter((alias) =>
    alias.aliases.includes(normalizedInput),
  ).map((alias) => alias.pokemonName)
}

function getMatchingAliases(normalizedInput: string): PokemonSearchAlias[] {
  return POKEMON_SEARCH_ALIASES.filter((alias) =>
    alias.aliases.some(
      (aliasText) =>
        aliasText.includes(normalizedInput) || normalizedInput.includes(aliasText),
    ),
  )
}

function getPatternCandidates(normalizedInput: string): string[] {
  const words = normalizedInput.split(' ')
  const candidates: string[] = []

  if (words[0] === 'mega' && words.length > 1) {
    candidates.push(toMegaCandidate(words.slice(1)))
  }

  if (words.at(-1) === 'mega' && words.length > 1) {
    candidates.push(toMegaCandidate(words.slice(0, -1)))
  }

  if (words.includes('mega') && words.length > 2) {
    const megaIndex = words.indexOf('mega')
    const nameWords = words.filter((_, index) => index !== megaIndex)

    candidates.push(toMegaCandidate(nameWords))
  }

  candidates.push(...getSuffixCandidates(words, ['gmax', 'gigantamax'], 'gmax'))
  candidates.push(...getRegionalCandidates(words))

  return candidates
}

function toMegaCandidate(words: string[]): string {
  const suffix = words.at(-1)

  if ((suffix === 'x' || suffix === 'y') && words.length > 1) {
    return `${hyphenateWords(words.slice(0, -1))}-mega-${suffix}`
  }

  return `${hyphenateWords(words)}-mega`
}

function getSuffixCandidates(
  words: string[],
  aliases: string[],
  suffix: string,
): string[] {
  const candidates: string[] = []
  const firstWord = words[0]
  const lastWord = words.at(-1)

  if (firstWord && aliases.includes(firstWord) && words.length > 1) {
    candidates.push(`${hyphenateWords(words.slice(1))}-${suffix}`)
  }

  if (lastWord && aliases.includes(lastWord) && words.length > 1) {
    candidates.push(`${hyphenateWords(words.slice(0, -1))}-${suffix}`)
  }

  return candidates
}

function getRegionalCandidates(words: string[]): string[] {
  const candidates: string[] = []
  const firstRegion = REGION_ALIASES[words[0] ?? '']
  const lastWord = words.at(-1)
  const lastRegion = lastWord ? REGION_ALIASES[lastWord] : undefined

  if (firstRegion && words.length > 1) {
    candidates.push(`${hyphenateWords(words.slice(1))}-${firstRegion}`)
  }

  if (lastRegion && words.length > 1) {
    candidates.push(`${hyphenateWords(words.slice(0, -1))}-${lastRegion}`)
  }

  return candidates
}

function hyphenatePokemonName(value: string): string {
  return hyphenateWords(value.split(' '))
}

function hyphenateWords(words: string[]): string {
  return words.filter(Boolean).join('-')
}

function uniqueSearchValues(values: PokemonSearchValue[]): PokemonSearchValue[] {
  const seen = new Set<string>()

  return values.filter((value) => {
    const key = String(value)

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function uniquePokemonSummaries(pokemons: PokemonSummary[]): PokemonSummary[] {
  const seen = new Set<string>()

  return pokemons.filter((pokemon) => {
    const key = pokemon.name

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function createAliasSummary(alias: PokemonSearchAlias): PokemonSummary {
  return {
    id: 0,
    name: alias.pokemonName,
    displayName: alias.label,
    sprite: '',
    imageUrl: '',
    types: [],
  }
}
