import type { HeldItemOption } from '../../types/pokemon'
import { formatPokemonName } from '../utils'

const curatedHeldItems: Array<Omit<HeldItemOption, 'displayName'>> = [
  {
    id: 'leftovers',
    name: 'leftovers',
    shortEffect: 'Restores a small amount of HP at the end of each turn.',
    category: 'recovery',
  },
  {
    id: 'life-orb',
    name: 'life-orb',
    shortEffect: 'Boosts move power, but costs HP after attacking.',
    category: 'damage',
  },
  {
    id: 'choice-band',
    name: 'choice-band',
    shortEffect: 'Boosts Attack while locking the holder into one move.',
    category: 'choice',
  },
  {
    id: 'choice-specs',
    name: 'choice-specs',
    shortEffect: 'Boosts Special Attack while locking the holder into one move.',
    category: 'choice',
  },
  {
    id: 'choice-scarf',
    name: 'choice-scarf',
    shortEffect: 'Boosts Speed while locking the holder into one move.',
    category: 'choice',
  },
  {
    id: 'focus-sash',
    name: 'focus-sash',
    shortEffect: 'Can let the holder survive a one-hit KO from full HP.',
    category: 'survival',
  },
  {
    id: 'assault-vest',
    name: 'assault-vest',
    shortEffect: 'Boosts Special Defense but prevents status moves.',
    category: 'bulk',
  },
  {
    id: 'rocky-helmet',
    name: 'rocky-helmet',
    shortEffect: 'Damages attackers that make contact.',
    category: 'chip',
  },
  {
    id: 'black-sludge',
    name: 'black-sludge',
    shortEffect: 'Restores Poison-type holders and damages others.',
    category: 'recovery',
  },
  {
    id: 'heavy-duty-boots',
    name: 'heavy-duty-boots',
    shortEffect: 'Prevents entry hazard damage and effects.',
    category: 'utility',
  },
  {
    id: 'expert-belt',
    name: 'expert-belt',
    shortEffect: 'Boosts super-effective move damage.',
    category: 'damage',
  },
  {
    id: 'weakness-policy',
    name: 'weakness-policy',
    shortEffect: 'Sharply boosts offenses after a super-effective hit.',
    category: 'setup',
  },
  {
    id: 'eviolite',
    name: 'eviolite',
    shortEffect: 'Boosts defenses if the holder can still evolve.',
    category: 'bulk',
  },
  {
    id: 'light-clay',
    name: 'light-clay',
    shortEffect: 'Extends Reflect, Light Screen and Aurora Veil duration.',
    category: 'support',
  },
  {
    id: 'muscle-band',
    name: 'muscle-band',
    shortEffect: 'Slightly boosts physical move damage.',
    category: 'damage',
  },
  {
    id: 'wise-glasses',
    name: 'wise-glasses',
    shortEffect: 'Slightly boosts special move damage.',
    category: 'damage',
  },
  {
    id: 'shell-bell',
    name: 'shell-bell',
    shortEffect: 'Restores HP based on damage dealt.',
    category: 'recovery',
  },
  {
    id: 'sitrus-berry',
    name: 'sitrus-berry',
    shortEffect: 'Restores HP when the holder is weakened.',
    category: 'berry',
  },
  {
    id: 'lum-berry',
    name: 'lum-berry',
    shortEffect: 'Cures one status condition or confusion.',
    category: 'berry',
  },
  {
    id: 'charizardite-x',
    name: 'charizardite-x',
    shortEffect: 'Allows Charizard to Mega Evolve into Mega Charizard X.',
    category: 'mega-stone',
  },
  {
    id: 'charizardite-y',
    name: 'charizardite-y',
    shortEffect: 'Allows Charizard to Mega Evolve into Mega Charizard Y.',
    category: 'mega-stone',
  },
  {
    id: 'lucarionite',
    name: 'lucarionite',
    shortEffect: 'Allows Lucario to Mega Evolve.',
    category: 'mega-stone',
  },
  {
    id: 'gengarite',
    name: 'gengarite',
    shortEffect: 'Allows Gengar to Mega Evolve.',
    category: 'mega-stone',
  },
  {
    id: 'venusaurite',
    name: 'venusaurite',
    shortEffect: 'Allows Venusaur to Mega Evolve.',
    category: 'mega-stone',
  },
  {
    id: 'blastoisinite',
    name: 'blastoisinite',
    shortEffect: 'Allows Blastoise to Mega Evolve.',
    category: 'mega-stone',
  },
]

export const CURATED_HELD_ITEMS: HeldItemOption[] = curatedHeldItems.map((item) => ({
  ...item,
  displayName: formatPokemonName(item.name),
}))

export function getCuratedHeldItems(): HeldItemOption[] {
  return CURATED_HELD_ITEMS
}

export function findHeldItemOption(value: string): HeldItemOption | null {
  const normalizedValue = normalizeItemSearch(value)

  if (!normalizedValue) {
    return null
  }

  return (
    CURATED_HELD_ITEMS.find(
      (item) =>
        normalizeItemSearch(item.name) === normalizedValue ||
        normalizeItemSearch(item.displayName) === normalizedValue,
    ) ?? null
  )
}

export function searchHeldItemOptions(value: string, maxItems = 8): HeldItemOption[] {
  const normalizedValue = normalizeItemSearch(value)

  if (!normalizedValue) {
    return CURATED_HELD_ITEMS.slice(0, maxItems)
  }

  return CURATED_HELD_ITEMS.filter((item) =>
    [item.name, item.displayName, item.category ?? '']
      .map(normalizeItemSearch)
      .some((searchable) => searchable.includes(normalizedValue)),
  ).slice(0, maxItems)
}

function normalizeItemSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
}
