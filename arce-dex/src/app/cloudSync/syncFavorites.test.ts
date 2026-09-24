import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFavoritesStore } from '@/features/favorites'
import { readBaseline, writeBaseline } from './syncBaseline'
import type { DomainSync } from './startDomainSync'

type Row = { user_id: string; pokemon_id: number }

/** Minimal in-memory stand-in for the bits of supabase-js the favorites sync uses. */
const fake = vi.hoisted(() => {
  const state = { rows: [] as Row[], failNextInsert: false }

  class Query {
    private mode: 'select' | 'insert' | 'delete' = 'select'
    private filters: Array<(row: Row) => boolean> = []
    private payload: Row[] = []

    select() {
      return this
    }
    insert(rows: Row[]) {
      this.mode = 'insert'
      this.payload = rows
      return this
    }
    delete() {
      this.mode = 'delete'
      return this
    }
    eq(column: keyof Row, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }
    in(column: keyof Row, values: unknown[]) {
      this.filters.push((row) => values.includes(row[column]))
      return this
    }
    then(resolve: (result: { data: Row[] | null; error: Error | null }) => void) {
      const matches = (row: Row) => this.filters.every((filter) => filter(row))
      if (this.mode === 'insert') {
        if (state.failNextInsert) {
          state.failNextInsert = false
          resolve({ data: null, error: new Error('network down') })
          return
        }
        state.rows.push(...this.payload)
      } else if (this.mode === 'delete') {
        state.rows = state.rows.filter((row) => !matches(row))
      }
      resolve({ data: state.rows.filter(matches).map((row) => ({ ...row })), error: null })
    }
  }

  const channel = { on: () => channel, subscribe: () => channel, topic: 'realtime:test' }
  const client = {
    from: () => new Query(),
    channel: () => channel,
    getChannels: () => [],
    removeChannel: async () => {},
  }

  return { state, client }
})

vi.mock('@/shared/services/supabase/client', () => ({ supabase: fake.client, isSupabaseConfigured: true }))

const { startFavoritesSync } = await import('./syncFavorites')

const USER = 'user-b'
const remoteIds = () => fake.state.rows.filter((row) => row.user_id === USER).map((row) => row.pokemon_id)
const localIds = () => useFavoritesStore.getState().favoritePokemonIds
let sync: DomainSync | null = null

beforeEach(async () => {
  fake.state.rows = []
  fake.state.failNextInsert = false
  localStorage.clear()
  await useFavoritesStore.persist.rehydrate()
  useFavoritesStore.setState({ favoritePokemonIds: [] })
})

afterEach(() => {
  sync?.stop()
  sync = null
})

describe('startFavoritesSync', () => {
  it('merges favorites made while logged out into an account that already has some', async () => {
    fake.state.rows = [{ user_id: USER, pokemon_id: 1 }]
    useFavoritesStore.setState({ favoritePokemonIds: [25, 1] })

    sync = await startFavoritesSync(USER, 'anonymous-data')

    expect(localIds()).toEqual([1, 25])
    expect(remoteIds()).toEqual([1, 25])
    expect(await readBaseline(USER, 'favorites')).toEqual([1, 25])
  })

  it('does not resurrect a favorite removed on another device', async () => {
    fake.state.rows = [{ user_id: USER, pokemon_id: 1 }]
    useFavoritesStore.setState({ favoritePokemonIds: [1, 25] })
    await writeBaseline(USER, 'favorites', [1, 25])

    sync = await startFavoritesSync(USER, 'same-user')

    expect(localIds()).toEqual([1])
    expect(remoteIds()).toEqual([1])
  })

  it('never uploads favorites that belong to another account', async () => {
    fake.state.rows = [{ user_id: USER, pokemon_id: 1 }]
    useFavoritesStore.setState({ favoritePokemonIds: [150, 151] })

    sync = await startFavoritesSync(USER, 'other-user')

    expect(localIds()).toEqual([1])
    expect(remoteIds()).toEqual([1])
  })

  it('retries a failed write on the next sync instead of dropping it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    await writeBaseline(USER, 'favorites', [])
    useFavoritesStore.setState({ favoritePokemonIds: [25] })
    fake.state.failNextInsert = true

    sync = await startFavoritesSync(USER, 'same-user')
    expect(sync?.initialSyncOk).toBe(false)
    expect(remoteIds()).toEqual([])

    await sync?.requestNow()
    expect(remoteIds()).toEqual([25])
    consoleError.mockRestore()
  })

  it('removes remotely a favorite the user removes while synced', async () => {
    fake.state.rows = [
      { user_id: USER, pokemon_id: 1 },
      { user_id: USER, pokemon_id: 25 },
    ]
    sync = await startFavoritesSync(USER, 'same-user')

    useFavoritesStore.getState().toggleFavorite(25)
    await sync?.requestNow()

    expect(remoteIds()).toEqual([1])
  })
})
