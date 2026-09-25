import zlib from 'node:zlib'
import { test as base, expect, type Page } from '@playwright/test'

// Deterministic stand-in for PokeAPI: a tiny roster, enough for every screen of the app.
const API = 'https://pokeapi.co/api/v2'
type Entry = { name: string; types: string[]; chain: number }
const roster: Record<number, Entry> = {
  25: { name: 'pikachu', types: ['electric'], chain: 10 },
  443: { name: 'gible', types: ['dragon', 'ground'], chain: 222 },
  444: { name: 'gabite', types: ['dragon', 'ground'], chain: 222 },
  445: { name: 'garchomp', types: ['dragon', 'ground'], chain: 222 },
  447: { name: 'riolu', types: ['fighting'], chain: 232 },
  448: { name: 'lucario', types: ['fighting', 'steel'], chain: 232 },
}
const idByName = Object.fromEntries(Object.entries(roster).map(([id, entry]) => [entry.name, Number(id)]))
const res = (name: string, kind: string) => ({ name, url: `${API}/${kind}/${name}/` })
const sprite = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
const moves = ['tackle', 'quick-attack', 'thunderbolt', 'earthquake', 'dragon-claw', 'aura-sphere']
const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
const text = (value: string) => ({
  language: res('en', 'language'),
  version_group: res('sv', 'version-group'),
  flavor_text: value,
  effect: value,
  short_effect: value,
})

function pokemon(id: number) {
  const entry = roster[id]
  return {
    id,
    name: entry.name,
    height: 10 + (id % 7),
    weight: 200 + id,
    species: res(entry.name, 'pokemon-species'),
    sprites: {
      front_default: sprite(id),
      front_shiny: sprite(id),
      other: { 'official-artwork': { front_default: sprite(id), front_shiny: sprite(id) } },
    },
    types: entry.types.map((type, index) => ({ slot: index + 1, type: res(type, 'type') })),
    abilities: [
      { is_hidden: false, ability: res('inner-focus', 'ability') },
      { is_hidden: true, ability: res('justified', 'ability') },
    ],
    stats: statNames.map((stat, index) => ({ base_stat: 50 + ((id * (index + 3)) % 80), stat: res(stat, 'stat') })),
    moves: moves.map((move, index) => ({
      move: res(move, 'move'),
      version_group_details: [{ level_learned_at: 1 + index * 7, move_learn_method: res('level-up', 'move-learn-method') }],
    })),
    forms: [res(entry.name, 'pokemon-form')],
    cries: { latest: null, legacy: null },
  }
}

function species(id: number) {
  const entry = roster[id]
  return {
    id,
    name: entry.name,
    base_happiness: 50,
    capture_rate: 45,
    gender_rate: 1,
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    generation: res('generation-iv', 'generation'),
    egg_groups: [res('monster', 'egg-group')],
    evolution_chain: { url: `${API}/evolution-chain/${entry.chain}/` },
    varieties: [{ is_default: true, pokemon: res(entry.name, 'pokemon') }],
  }
}

type EvolutionNode = { species: { name: string; url: string }; evolution_details: unknown[]; evolves_to: EvolutionNode[] }
const node = (name: string, next: EvolutionNode[] = []): EvolutionNode => ({
  species: res(name, 'pokemon-species'),
  evolution_details: [
    {
      min_level: 20, min_happiness: null, time_of_day: '', gender: null, location: null, held_item: null, item: null,
      known_move: null, min_beauty: null, min_affection: null, needs_overworld_rain: false,
      relative_physical_stats: null, trigger: res('level-up', 'evolution-trigger'),
    },
  ],
  evolves_to: next,
})
const chains: Record<string, unknown> = {
  10: { id: 10, chain: node('pikachu') },
  222: { id: 222, chain: node('gible', [node('gabite', [node('garchomp')])]) },
  232: { id: 232, chain: node('riolu', [node('lucario')]) },
}

function respond(url: string): unknown {
  const path = url.replace(API, '').replace(/\/$/, '')
  const lookup = (key: string) => (/^\d+$/.test(key) ? Number(key) : idByName[key])
  let match: RegExpMatchArray | null
  if (/^\/pokemon\?/.test(path)) {
    const results = Object.entries(roster).map(([id, entry]) => ({ name: entry.name, url: `${API}/pokemon/${id}/` }))
    return { count: results.length, next: null, previous: null, results }
  }
  if ((match = path.match(/^\/pokemon\/([^/?]+)$/)) && roster[lookup(match[1])]) return pokemon(lookup(match[1]))
  if ((match = path.match(/^\/pokemon-species\/([^/?]+)$/)) && roster[lookup(match[1])]) return species(lookup(match[1]))
  if ((match = path.match(/^\/pokemon-form\/([^/?]+)$/)) && roster[lookup(match[1])]) {
    const id = lookup(match[1])
    return { id, name: roster[id].name, is_default: true, pokemon: res(roster[id].name, 'pokemon'), sprites: { front_default: sprite(id) } }
  }
  if ((match = path.match(/^\/evolution-chain\/(\d+)$/)) && chains[match[1]]) return chains[match[1]]
  if ((match = path.match(/^\/move\/([^/?]+)$/))) {
    const index = Math.max(0, moves.indexOf(match[1]))
    return {
      id: index + 1, name: match[1], accuracy: 100, effect_chance: null, pp: 15, power: 40 + index * 15,
      type: res(['normal', 'normal', 'electric', 'ground', 'dragon', 'fighting'][index], 'type'),
      damage_class: res(index % 2 ? 'special' : 'physical', 'move-damage-class'),
      effect_entries: [text('Inflicts damage.')], flavor_text_entries: [text('A test move.')],
    }
  }
  if ((match = path.match(/^\/ability\/([^/?]+)$/))) {
    return { id: 39, name: match[1], generation: res('generation-iv', 'generation'), effect_entries: [text('Test ability effect.')], flavor_text_entries: [text('Test ability.')] }
  }
  return null
}

// 1×1 PNG colored per id, so sprites render as distinct squares.
function png(red: number, green: number, blue: number) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  const crc = (buffer: Buffer) => {
    let c = 0xffffffff
    for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const typed = Buffer.concat([Buffer.from(type), data])
    const checksum = Buffer.alloc(4)
    checksum.writeUInt32BE(crc(typed))
    return Buffer.concat([length, typed, checksum])
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(1, 0)
  header.writeUInt32BE(1, 4)
  header[8] = 8
  header[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(Buffer.from([0, red, green, blue]))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

export async function installFakePokeApi(page: Page) {
  const cors = { 'access-control-allow-origin': '*' }
  await page.route('https://pokeapi.co/**', (route) => {
    const body = respond(route.request().url())
    return body ? route.fulfill({ json: body, headers: cors }) : route.fulfill({ status: 404, body: 'not found', headers: cors })
  })
  await page.route('https://raw.githubusercontent.com/**', (route) => {
    const id = Number(route.request().url().match(/(\d+)\.png/)?.[1] ?? 0)
    return route.fulfill({ body: png((id * 37) % 256, (id * 91) % 256, (id * 53) % 256), contentType: 'image/png' })
  })
  // Anything else external (fonts, Supabase) is aborted so nothing hangs.
  await page.route(/^https:\/\/(?!pokeapi\.co|raw\.githubusercontent\.com)/, (route) => route.abort())
}

/** Every test starts on the app with the fake API installed and Lucario (the default) loaded. */
export const test = base.extend<{ app: Page }>({
  app: async ({ page }, use) => {
    await installFakePokeApi(page)
    await use(page)
  },
})

export async function openApp(page: Page, path = '/') {
  await page.goto(path)
  await expect(page).toHaveTitle(/·|Archivum Arceus/)
  await page.waitForLoadState('networkidle')
}

/**
 * Shows another Pokémon without reloading the page (like picking a search result). Use this,
 * not page.goto, right after a click that saves something: a reload can land before the
 * async localForage (IndexedDB) write, and the favorite/team member is silently lost.
 */
export async function visitPokemon(page: Page, name: string) {
  await page.evaluate((pokemon) => {
    history.pushState(null, '', `/?pokemon=${pokemon}`)
    dispatchEvent(new PopStateEvent('popstate'))
  }, name)
  await expect(page).toHaveTitle(new RegExp(`^${name}`, 'i'))
}

export { expect }
