import { supabase } from '@/shared/services/supabase/client'
import { useFavoritesStore } from '@/features/favorites'
import { mergeSet } from './merge/mergeSet'
import { readBaseline, writeBaseline, type DataOwnership } from './syncBaseline'
import { startDomainSync, type DomainSync } from './startDomainSync'

export async function startFavoritesSync(userId: string, ownership: DataOwnership): Promise<DomainSync | null> {
  if (!supabase) {
    return null
  }

  const client = supabase
  let lastApplied: number[] | null = null

  async function reconcile(currentOwnership: DataOwnership) {
    const { data, error } = await client.from('favorites').select('pokemon_id').eq('user_id', userId)
    if (error) {
      throw error
    }

    const remote = data.map((row) => row.pokemon_id as number)
    const isOtherUser = currentOwnership === 'other-user'
    const baseline = isOtherUser ? remote : await readBaseline<number[]>(userId, 'favorites')
    // Read local only after the last await: from here to applyToStore nothing can interleave,
    // so a toggle the user makes mid-sync is never overwritten (it just triggers another run).
    const local = isOtherUser ? remote : useFavoritesStore.getState().favoritePokemonIds
    const { merged, toInsert, toDelete } = mergeSet(local, remote, baseline)

    applyToStore(merged)

    const results = await Promise.all([
      toInsert.length > 0
        ? client.from('favorites').insert(toInsert.map((pokemonId) => ({ user_id: userId, pokemon_id: pokemonId })))
        : null,
      toDelete.length > 0
        ? client.from('favorites').delete().eq('user_id', userId).in('pokemon_id', toDelete)
        : null,
    ])
    const failed = results.find((result) => result?.error)
    if (failed?.error) {
      throw failed.error
    }

    await writeBaseline(userId, 'favorites', merged)
  }

  function applyToStore(merged: number[]) {
    const current = useFavoritesStore.getState().favoritePokemonIds
    const isSame = current.length === merged.length && current.every((id, index) => id === merged[index])

    if (!isSame) {
      useFavoritesStore.setState({ favoritePokemonIds: merged })
    }
    lastApplied = useFavoritesStore.getState().favoritePokemonIds
  }

  return startDomainSync({
    client,
    domain: 'favorites',
    table: 'favorites',
    userId,
    ownership,
    store: useFavoritesStore,
    reconcile,
    subscribeToLocalChanges: (onChange) =>
      useFavoritesStore.subscribe((state) => {
        if (state.favoritePokemonIds !== lastApplied) {
          onChange()
        }
      }),
  })
}
