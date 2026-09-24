export type SetMergeResult<T> = {
  merged: T[]
  toInsert: T[]
  toDelete: T[]
}

/**
 * Three-way merge for a set that supports removal (e.g. favorites).
 *
 * `baseline` is the last state local and remote agreed on. Without it (`null`, never synced
 * on this device) the best we can do is a union. With it, we can tell "removed on the other
 * device" (in baseline + local, missing remotely → stays removed) apart from "added here"
 * (in local, missing from baseline → push it).
 */
export function mergeSet<T>(local: T[], remote: T[], baseline: T[] | null): SetMergeResult<T> {
  const remoteSet = new Set(remote)

  if (baseline === null) {
    const toInsert = unique(local.filter((item) => !remoteSet.has(item)))
    return { merged: unique([...remote, ...toInsert]), toInsert, toDelete: [] }
  }

  const localSet = new Set(local)
  const baselineSet = new Set(baseline)
  const addedLocally = unique(local.filter((item) => !baselineSet.has(item)))
  const removedLocally = new Set(baseline.filter((item) => !localSet.has(item)))

  const merged = unique([...remote, ...addedLocally]).filter((item) => !removedLocally.has(item))
  const toInsert = addedLocally.filter((item) => !remoteSet.has(item))
  const toDelete = [...removedLocally].filter((item) => remoteSet.has(item))

  return { merged, toInsert, toDelete }
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}
