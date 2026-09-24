import { getSupabase } from '@/shared/services/supabase/client'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import { mergeLww } from './merge/mergeLww'
import type { DataOwnership } from './syncBaseline'
import { startDomainSync, type DomainSync } from './startDomainSync'

type Theme = 'light' | 'dark' | 'system'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export async function startSettingsSync(userId: string, ownership: DataOwnership): Promise<DomainSync | null> {
  const loadedClient = await getSupabase()
  if (!loadedClient) {
    return null
  }
  const client = loadedClient
  let lastApplied: { theme: Theme; updatedAt?: string } | null = null

  async function reconcile(currentOwnership: DataOwnership) {
    const { data, error } = await client
      .from('settings')
      .select('theme, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      throw error
    }

    const remote =
      data && isTheme(data.theme)
        ? [{ key: 'settings', updatedAt: data.updated_at as string, value: data.theme }]
        : []
    const { theme, updatedAt } = useSettingsStore.getState()
    const local = currentOwnership === 'other-user' ? [] : [{ key: 'settings', updatedAt, value: theme }]
    const { merged, toUpsert } = mergeLww(local, remote)
    const winner = merged[0]

    if (winner && (winner.value !== theme || winner.updatedAt !== updatedAt)) {
      useSettingsStore.setState({ theme: winner.value, updatedAt: winner.updatedAt })
    }
    const state = useSettingsStore.getState()
    lastApplied = { theme: state.theme, updatedAt: state.updatedAt }

    if (toUpsert.length > 0) {
      const { error: upsertError } = await client.from('settings').upsert({
        user_id: userId,
        theme: toUpsert[0].value,
        updated_at: toUpsert[0].updatedAt ?? new Date(0).toISOString(),
      })
      if (upsertError) {
        throw upsertError
      }
    }
  }

  return startDomainSync({
    client,
    domain: 'settings',
    table: 'settings',
    userId,
    ownership,
    store: useSettingsStore,
    reconcile,
    subscribeToLocalChanges: (onChange) =>
      useSettingsStore.subscribe((state) => {
        if (state.theme !== lastApplied?.theme || state.updatedAt !== lastApplied?.updatedAt) {
          onChange()
        }
      }),
  })
}
