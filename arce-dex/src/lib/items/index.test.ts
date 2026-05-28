import { describe, expect, it } from 'vitest'
import {
  CURATED_HELD_ITEMS,
  findHeldItemOption,
  getCuratedHeldItems,
  searchHeldItemOptions,
} from '.'

const requiredItems = [
  'leftovers',
  'life-orb',
  'choice-band',
  'choice-specs',
  'choice-scarf',
  'focus-sash',
  'assault-vest',
  'rocky-helmet',
  'black-sludge',
  'heavy-duty-boots',
  'expert-belt',
  'weakness-policy',
  'eviolite',
  'light-clay',
  'muscle-band',
  'wise-glasses',
  'shell-bell',
  'sitrus-berry',
  'lum-berry',
  'charizardite-x',
  'charizardite-y',
  'lucarionite',
  'gengarite',
  'venusaurite',
  'blastoisinite',
]

describe('curated held items', () => {
  it('contains the required competitive items', () => {
    const itemNames = new Set(CURATED_HELD_ITEMS.map((item) => item.name))

    requiredItems.forEach((itemName) => {
      expect(itemNames.has(itemName)).toBe(true)
    })
  })

  it('exposes a safe readonly-style list copy through the getter', () => {
    expect(getCuratedHeldItems()).toEqual(CURATED_HELD_ITEMS)
    expect(getCuratedHeldItems()).toHaveLength(requiredItems.length)
  })

  it('finds items by API name and display name', () => {
    expect(findHeldItemOption('life-orb')?.displayName).toBe('Life Orb')
    expect(findHeldItemOption('Life Orb')?.name).toBe('life-orb')
    expect(findHeldItemOption('heavy duty boots')?.name).toBe('heavy-duty-boots')
  })

  it('returns null for unknown held items', () => {
    expect(findHeldItemOption('unknown item')).toBeNull()
    expect(findHeldItemOption('')).toBeNull()
  })

  it('searches by name, display name and category with a safe max limit', () => {
    expect(searchHeldItemOptions('choice').map((item) => item.name)).toEqual([
      'choice-band',
      'choice-specs',
      'choice-scarf',
    ])
    expect(searchHeldItemOptions('mega stone').map((item) => item.name)).toContain(
      'lucarionite',
    )
    expect(searchHeldItemOptions('', 3)).toHaveLength(3)
  })
})
