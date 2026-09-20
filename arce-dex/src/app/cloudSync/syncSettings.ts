import { supabase } from '@/shared/services/supabase/client'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import { decideSyncStrategy } from './decideSyncStrategy'

export async function startSettingsSync(userId: string): Promise<() => void> {
  if (!supabase) {
    return () => {}
  }

  const client = supabase

  const { data: remoteRows } = await client.from('settings').select('theme').eq('user_id', userId)
  const strategy = decideSyncStrategy(remoteRows ?? [])

  if (strategy === 'push') {
    const theme = useSettingsStore.getState().theme
    await client.from('settings').insert({ user_id: userId, theme })
  } else {
    const theme = (remoteRows ?? [])[0]?.theme as string | undefined
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      useSettingsStore.setState({ theme })
    }
  }

  let isApplyingRemote = false

  const topic = `settings-${userId}`
  const existingChannel = client.getChannels().find((ch) => ch.topic === `realtime:${topic}`)
  if (existingChannel) {
    await client.removeChannel(existingChannel)
  }

  const channel = client
    .channel(topic)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: `user_id=eq.${userId}` },
      async () => {
        isApplyingRemote = true
        const { data } = await client.from('settings').select('theme').eq('user_id', userId).maybeSingle()
        const theme = data?.theme as string | undefined
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
          useSettingsStore.setState({ theme })
        }
        isApplyingRemote = false
      },
    )
    .subscribe()

  const unsubscribeStore = useSettingsStore.subscribe((state) => {
    if (isApplyingRemote) {
      return
    }

    void client
      .from('settings')
      .upsert({ user_id: userId, theme: state.theme, updated_at: new Date().toISOString() })
      .then()
  })

  return () => {
    unsubscribeStore()
    void client.removeChannel(channel)
  }
}
