import type { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates (or re-creates) a Realtime channel subscribed to changes on one table for one user.
 * Removes any existing channel with the same topic first — calling `.channel(topic)` twice
 * without this throws ("cannot add postgres_changes callbacks... after subscribe()"), which
 * happens in dev under React StrictMode's double-effect-invoke.
 */
export async function subscribeToTableChanges(
  client: SupabaseClient,
  topic: string,
  table: string,
  userId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void | Promise<void>,
): Promise<RealtimeChannel> {
  const existingChannel = client.getChannels().find((channel) => channel.topic === `realtime:${topic}`)
  if (existingChannel) {
    await client.removeChannel(existingChannel)
  }

  return client
    .channel(topic)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
      onChange,
    )
    .subscribe()
}
