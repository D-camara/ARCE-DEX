import { supabase } from '@/shared/services/supabase/client'
import { useFavoritesStore } from '@/features/favorites'
import { decideSyncStrategy } from './decideSyncStrategy'

export async function startFavoritesSync(userId: string): Promise<() => void> {
  if (!supabase) {
    return () => {}
  }

  const client = supabase

  const { data: remoteRows } = await client
    .from('favorites')
    .select('pokemon_id')
    .eq('user_id', userId)

  const strategy = decideSyncStrategy(remoteRows ?? [])

  if (strategy === 'push') {
    const localIds = useFavoritesStore.getState().favoritePokemonIds
    if (localIds.length > 0) {
      await client
        .from('favorites')
        .insert(localIds.map((pokemonId) => ({ user_id: userId, pokemon_id: pokemonId })))
    }
  } else {
    const remoteIds = (remoteRows ?? []).map((row) => row.pokemon_id as number)
    useFavoritesStore.setState({ favoritePokemonIds: remoteIds })
  }

  let isApplyingRemote = false

  const topic = `favorites-${userId}`
  const existingChannel = client.getChannels().find((ch) => ch.topic === `realtime:${topic}`)
  if (existingChannel) {
    await client.removeChannel(existingChannel)
  }

  const channel = client
    .channel(topic)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${userId}` },
      async () => {
        isApplyingRemote = true
        const { data } = await client.from('favorites').select('pokemon_id').eq('user_id', userId)
        useFavoritesStore.setState({ favoritePokemonIds: (data ?? []).map((row) => row.pokemon_id as number) })
        isApplyingRemote = false
      },
    )
    .subscribe()

  let previousIds = useFavoritesStore.getState().favoritePokemonIds

  const unsubscribeStore = useFavoritesStore.subscribe((state) => {
    if (isApplyingRemote) {
      previousIds = state.favoritePokemonIds
      return
    }

    const added = state.favoritePokemonIds.filter((id) => !previousIds.includes(id))
    const removed = previousIds.filter((id) => !state.favoritePokemonIds.includes(id))
    previousIds = state.favoritePokemonIds

    added.forEach((pokemonId) => {
      void client.from('favorites').insert({ user_id: userId, pokemon_id: pokemonId }).then()
    })
    removed.forEach((pokemonId) => {
      void client.from('favorites').delete().eq('user_id', userId).eq('pokemon_id', pokemonId).then()
    })
  })

  return () => {
    unsubscribeStore()
    void client.removeChannel(channel)
  }
}
