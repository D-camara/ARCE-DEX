import { supabase } from '@/shared/services/supabase/client'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import { decideSyncStrategy } from './decideSyncStrategy'
import { subscribeToTableChanges } from './realtimeChannel'

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

  const channel = await subscribeToTableChanges(client, `settings-${userId}`, 'settings', userId, async () => {
    isApplyingRemote = true
    const { data } = await client.from('settings').select('theme').eq('user_id', userId).maybeSingle()
    const theme = data?.theme as string | undefined
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      useSettingsStore.setState({ theme })
    }
    isApplyingRemote = false
  })

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
