import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTeamStore } from '@/features/team'
import type { TeamPokemon } from '@/shared/types/team'
import type { DomainSync } from './startDomainSync'

type Row = Record<string, unknown>

/** Minimal in-memory stand-in for the bits of supabase-js the teams sync uses. */
const fake = vi.hoisted(() => {
  const tables: Record<string, Row[]> = { teams: [], team_slots: [] }
  let nextId = 1

  class Query {
    private mode: 'select' | 'upsert' | 'update' = 'select'
    private filters: Array<(row: Row) => boolean> = []
    private payload: Row[] = []
    private isSingle = false
    private table: string

    constructor(table: string) {
      this.table = table
    }

    select() {
      return this
    }
    upsert(rows: Row | Row[]) {
      this.mode = 'upsert'
      this.payload = Array.isArray(rows) ? rows : [rows]
      return this
    }
    update(values: Row) {
      this.mode = 'update'
      this.payload = [values]
      return this
    }
    eq(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }
    in(column: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[column]))
      return this
    }
    single() {
      this.isSingle = true
      return this
    }
    then(resolve: (result: { data: unknown; error: null }) => void) {
      const rows = tables[this.table]
      const matches = (row: Row) => this.filters.every((filter) => filter(row))
      let result: Row[] = rows.filter(matches)

      if (this.mode === 'upsert') {
        result = this.payload.map((incoming) => {
          const sameKey = (row: Row) =>
            this.table === 'teams'
              ? row.user_id === incoming.user_id && row.client_team_id === incoming.client_team_id
              : row.team_id === incoming.team_id && row.slot_index === incoming.slot_index
          const existing = rows.find(sameKey)
          if (existing) {
            Object.assign(existing, incoming)
            return existing
          }
          const created = { ...incoming, id: this.table === 'teams' ? `remote-${nextId++}` : undefined }
          rows.push(created)
          return created
        })
      } else if (this.mode === 'update') {
        result.forEach((row) => Object.assign(row, this.payload[0]))
      }

      const data = result.map((row) => ({ ...row }))
      resolve({ data: this.isSingle ? data[0] : data, error: null })
    }
  }

  const channel = { on: () => channel, subscribe: () => channel, topic: 'realtime:test' }
  const client = {
    from: (table: string) => new Query(table),
    channel: () => channel,
    getChannels: () => [],
    removeChannel: async () => {},
  }
  return { tables, client }
})

vi.mock('@/shared/services/supabase/client', () => ({ getSupabase: async () => fake.client, isSupabaseConfigured: true }))

const { startTeamsSync } = await import('./syncTeams')

const USER = 'user-a'
const member = (id: number, name: string): TeamPokemon => ({ id, name, displayName: name, sprite: '', types: ['dragon'] })
const remoteOrder = () =>
  fake.tables.team_slots
    .filter((row) => row.team_id === 'remote-1')
    .sort((left, right) => Number(left.slot_index) - Number(right.slot_index))
    .map((row) => (row.pokemon as TeamPokemon | null)?.name ?? null)
let sync: DomainSync | null = null

beforeEach(async () => {
  fake.tables.teams = []
  fake.tables.team_slots = []
  localStorage.clear()
  await useTeamStore.persist.rehydrate()
  useTeamStore.setState(useTeamStore.getInitialState(), true)
})

afterEach(() => {
  sync?.stop()
  sync = null
})

describe('startTeamsSync', () => {
  it('pushes a reordered team so other devices get the new order', async () => {
    const { addPokemonToTeam } = useTeamStore.getState()
    addPokemonToTeam('team-1', member(445, 'garchomp'))
    addPokemonToTeam('team-1', member(448, 'lucario'))
    sync = await startTeamsSync(USER, 'same-user')
    expect(remoteOrder().slice(0, 3)).toEqual(['garchomp', 'lucario', null])

    useTeamStore.getState().moveSlot('team-1', 0, 2)
    await sync?.requestNow()

    expect(remoteOrder().slice(0, 3)).toEqual(['lucario', null, 'garchomp'])
  })
})
