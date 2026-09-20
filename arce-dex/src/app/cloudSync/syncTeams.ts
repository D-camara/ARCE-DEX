import { supabase } from '@/shared/services/supabase/client'
import { useTeamStore } from '@/features/team'
import { decideSyncStrategy } from './decideSyncStrategy'
import type { Team, TeamPokemon } from '@/shared/types/team'

type RemoteTeamRow = { id: string; client_team_id: string; name: string }
type RemoteSlotRow = { team_id: string; slot_index: number; pokemon: TeamPokemon | null }

async function fetchRemoteTeams(userId: string) {
  if (!supabase) {
    return []
  }

  const { data: teamRows } = await supabase
    .from('teams')
    .select('id, client_team_id, name')
    .eq('user_id', userId)

  if (!teamRows || teamRows.length === 0) {
    return []
  }

  const { data: slotRows } = await supabase
    .from('team_slots')
    .select('team_id, slot_index, pokemon')
    .in('team_id', teamRows.map((row) => row.id))

  return teamRows.map((teamRow) => buildTeam(teamRow, slotRows ?? []))
}

function buildTeam(teamRow: RemoteTeamRow, slotRows: RemoteSlotRow[]): Team {
  const slots = Array.from({ length: 6 }, (_, index) => {
    const slotRow = slotRows.find((row) => row.team_id === teamRow.id && row.slot_index === index)
    return { id: `${teamRow.client_team_id}-slot-${index + 1}`, pokemon: slotRow?.pokemon ?? null }
  })

  return { id: teamRow.client_team_id, name: teamRow.name, slots }
}

async function pushTeam(userId: string, team: Team) {
  if (!supabase) {
    return
  }

  const { data: upserted } = await supabase
    .from('teams')
    .upsert(
      { user_id: userId, client_team_id: team.id, name: team.name, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,client_team_id' },
    )
    .select('id')
    .single()

  if (!upserted) {
    return
  }

  await supabase.from('team_slots').upsert(
    team.slots.map((slot, index) => ({
      team_id: upserted.id,
      slot_index: index,
      pokemon: slot.pokemon,
      updated_at: new Date().toISOString(),
    })),
  )
}

export async function startTeamsSync(userId: string): Promise<() => void> {
  if (!supabase) {
    return () => {}
  }

  const client = supabase

  const { data: remoteTeamRows } = await client.from('teams').select('id').eq('user_id', userId)
  const strategy = decideSyncStrategy(remoteTeamRows ?? [])

  if (strategy === 'push') {
    const localTeams = useTeamStore.getState().teams
    for (const team of localTeams) {
      await pushTeam(userId, team)
    }
  } else {
    const remoteTeams = await fetchRemoteTeams(userId)
    if (remoteTeams.length > 0) {
      useTeamStore.setState({ teams: remoteTeams })
    }
  }

  let isApplyingRemote = false

  async function reloadFromRemote() {
    isApplyingRemote = true
    const remoteTeams = await fetchRemoteTeams(userId)
    if (remoteTeams.length > 0) {
      useTeamStore.setState({ teams: remoteTeams })
    }
    isApplyingRemote = false
  }

  const topic = `teams-${userId}`
  const existingChannel = client.getChannels().find((ch) => ch.topic === `realtime:${topic}`)
  if (existingChannel) {
    await client.removeChannel(existingChannel)
  }

  const channel = client
    .channel(topic)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'teams', filter: `user_id=eq.${userId}` },
      reloadFromRemote,
    )
    .subscribe()

  let pushTimer: ReturnType<typeof setTimeout> | undefined

  const unsubscribeStore = useTeamStore.subscribe((state) => {
    if (isApplyingRemote) {
      return
    }

    clearTimeout(pushTimer)
    pushTimer = setTimeout(() => {
      state.teams.forEach((team) => {
        void pushTeam(userId, team)
      })
    }, 300)
  })

  return () => {
    clearTimeout(pushTimer)
    unsubscribeStore()
    void client.removeChannel(channel)
  }
}
