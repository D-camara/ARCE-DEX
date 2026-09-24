import { readStorageItem, writeStorageItem } from '@/shared/lib/storage'

const LAST_SYNCED_USER_KEY = 'arce-dex:sync-last-user'

export type SyncDomain = 'favorites'

/**
 * Who the data currently in local storage belongs to, relative to the user logging in:
 * - `anonymous-data`: never synced — made while logged out, safe to merge up into the account.
 * - `same-user`: already synced with this account before — normal merge.
 * - `other-user`: synced with a different account — must NOT leak into this one; remote wins.
 */
export type DataOwnership = 'anonymous-data' | 'same-user' | 'other-user'

export function resolveOwnership(lastSyncedUserId: string | null, userId: string): DataOwnership {
  if (lastSyncedUserId === null) {
    return 'anonymous-data'
  }
  return lastSyncedUserId === userId ? 'same-user' : 'other-user'
}

function baselineKey(userId: string, domain: SyncDomain) {
  return `arce-dex:sync-baseline:${userId}:${domain}`
}

export function readBaseline<T>(userId: string, domain: SyncDomain): Promise<T | null> {
  return readStorageItem<T | null>(baselineKey(userId, domain), null)
}

export function writeBaseline<T>(userId: string, domain: SyncDomain, value: T): Promise<void> {
  return writeStorageItem(baselineKey(userId, domain), value)
}

export function readLastSyncedUserId(): Promise<string | null> {
  return readStorageItem<string | null>(LAST_SYNCED_USER_KEY, null)
}

export function writeLastSyncedUserId(userId: string): Promise<void> {
  return writeStorageItem(LAST_SYNCED_USER_KEY, userId)
}
