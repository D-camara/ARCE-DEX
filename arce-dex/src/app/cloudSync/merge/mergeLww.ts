export type LwwEntry<T> = {
  key: string
  updatedAt: string | undefined
  value: T
}

export type LwwMergeResult<T> = {
  merged: LwwEntry<T>[]
  toUpsert: LwwEntry<T>[]
}

function toTime(updatedAt: string | undefined) {
  const time = updatedAt ? Date.parse(updatedAt) : Number.NaN
  return Number.isNaN(time) ? 0 : time
}

/**
 * Last-write-wins per key. Ties go to remote so an entry that is already stored never gets
 * re-sent forever. A missing/invalid timestamp counts as the oldest possible write.
 */
export function mergeLww<T>(local: LwwEntry<T>[], remote: LwwEntry<T>[]): LwwMergeResult<T> {
  const remoteByKey = new Map(remote.map((entry) => [entry.key, entry]))
  const localKeys = new Set(local.map((entry) => entry.key))
  const merged: LwwEntry<T>[] = []
  const toUpsert: LwwEntry<T>[] = []

  for (const localEntry of local) {
    const remoteEntry = remoteByKey.get(localEntry.key)

    if (!remoteEntry || toTime(localEntry.updatedAt) > toTime(remoteEntry.updatedAt)) {
      merged.push(localEntry)
      toUpsert.push(localEntry)
    } else {
      merged.push(remoteEntry)
    }
  }

  for (const remoteEntry of remote) {
    if (!localKeys.has(remoteEntry.key)) {
      merged.push(remoteEntry)
    }
  }

  return { merged, toUpsert }
}
