import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from '@/shared/services/supabase/client'
import { createDefaultTeams, useTeamStore } from '@/features/team'
import type { Team, TeamPokemon } from '@/shared/types/team'
import { mergeLww, type LwwEntry } from './merge/mergeLww'
import type { DataOwnership } from './syncBaseline'
import { startDomainSync, type DomainSync } from './startDomainSync'

type RemoteTeamRow = { id: string; client_team_id: string; name: string; updated_at: string }
type RemoteSlotRow = { team_id: string; slot_index: number; pokemon: TeamPokemon | null }

const EPOCH = new Date(0).toISOString()

const toLwwEntry = (team: Team): LwwEntry<Team> => ({ key: team.id, updatedAt: team.updatedAt, value: team })

function buildTeam(teamRow: RemoteTeamRow, slotRows: RemoteSlotRow[]): Team {
  const slots = Array.from({ length: 6 }, (_, index) => {
    const slotRow = slotRows.find((row) => row.team_id === teamRow.id && row.slot_index === index)
    return { id: `${teamRow.client_team_id}-slot-${index + 1}`, pokemon: slotRow?.pokemon ?? null }
  })

  return { id: teamRow.client_team_id, name: teamRow.name, slots, updatedAt: teamRow.updated_at }
}

async function fetchRemoteTeams(client: SupabaseClient, userId: string): Promise<Team[]> {
  const { data: teamRows, error } = await client
    .from('teams')
    .select('id, client_team_id, name, updated_at')
    .eq('user_id', userId)
  if (error) {
    throw error
  }
  if (teamRows.length === 0) {
    return []
  }

  const { data: slotRows, error: slotsError } = await client
    .from('team_slots')
    .select('team_id, slot_index, pokemon')
    .in('team_id', teamRows.map((row) => row.id))
  if (slotsError) {
    throw slotsError
  }

  return teamRows.map((teamRow) => buildTeam(teamRow as RemoteTeamRow, slotRows as RemoteSlotRow[]))
}

async function pushTeam(client: SupabaseClient, userId: string, team: Team) {
  const updatedAt = team.updatedAt ?? EPOCH
  const { data: upserted, error } = await client
    .from('teams')
    .upsert(
      { user_id: userId, client_team_id: team.id, name: team.name, updated_at: updatedAt },
      { onConflict: 'user_id,client_team_id' },
    )
    .select('id')
    .single()
  if (error) {
    throw error
  }

  const { error: slotsError } = await client.from('team_slots').upsert(
    team.slots.map((slot, index) => ({
      team_id: upserted.id,
      slot_index: index,
      pokemon: slot.pokemon,
      updated_at: updatedAt,
    })),
  )
  if (slotsError) {
    throw slotsError
  }

  // team_slots has no user_id, so Realtime only watches `teams`. Touch the team row once
  // more *after* the slots are written, so other devices reload a complete team.
  const { error: touchError } = await client.from('teams').update({ updated_at: updatedAt }).eq('id', upserted.id)
  if (touchError) {
    throw touchError
  }
}

export async function startTeamsSync(userId: string, ownership: DataOwnership): Promise<DomainSync | null> {
  const loadedClient = await getSupabase()
  if (!loadedClient) {
    return null
  }
  const client = loadedClient
  let lastApplied: Team[] | null = null

  async function reconcile(currentOwnership: DataOwnership) {
    const remoteTeams = await fetchRemoteTeams(client, userId)
    const isOtherUser = currentOwnership === 'other-user'
    const baseTeams = isOtherUser ? createDefaultTeams() : useTeamStore.getState().teams
    const local = isOtherUser ? [] : baseTeams
    const { merged, toUpsert } = mergeLww(local.map(toLwwEntry), remoteTeams.map(toLwwEntry))
    const mergedById = new Map(merged.map((entry) => [entry.key, entry.value]))

    // Team ids are fixed (team-1..team-6); ignore anything else that may be stored remotely.
    applyToStore(baseTeams.map((team) => mergedById.get(team.id) ?? team))

    for (const { value } of toUpsert) {
      await pushTeam(client, userId, value)
    }
  }

  function applyToStore(teams: Team[]) {
    const current = useTeamStore.getState().teams

    if (JSON.stringify(current) !== JSON.stringify(teams)) {
      useTeamStore.setState({ teams })
    }
    lastApplied = useTeamStore.getState().teams
  }

  return startDomainSync({
    client,
    domain: 'teams',
    table: 'teams',
    userId,
    ownership,
    store: useTeamStore,
    reconcile,
    subscribeToLocalChanges: (onChange) =>
      useTeamStore.subscribe((state) => {
        if (state.teams !== lastApplied) {
          onChange()
        }
      }),
  })
}
