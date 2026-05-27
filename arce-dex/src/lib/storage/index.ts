import localForage from 'localforage'
import { del, get, set } from 'idb-keyval'
import type { StateStorage } from 'zustand/middleware'

export const storageKeys = {
  teams: 'arce-dex:teams',
  favorites: 'arce-dex:favorites',
  history: 'arce-dex:history',
  settings: 'arce-dex:settings',
  apiCachePrefix: 'arce-dex:api-cache:',
} as const

localForage.config({
  name: 'ARCE-DEX',
  storeName: 'user-data',
  description: 'ARCE-DEX local user data',
})

export async function readStorageItem<T>(key: string, fallback: T): Promise<T> {
  const storedValue = await localForage.getItem<T>(key)

  return storedValue ?? fallback
}

export async function writeStorageItem<T>(key: string, value: T): Promise<void> {
  await localForage.setItem(key, value)
}

export async function removeStorageItem(key: string): Promise<void> {
  await localForage.removeItem(key)
}

export async function readApiCacheItem<T>(key: string): Promise<T | undefined> {
  return get<T>(`${storageKeys.apiCachePrefix}${key}`)
}

export async function writeApiCacheItem<T>(key: string, value: T): Promise<void> {
  await set(`${storageKeys.apiCachePrefix}${key}`, value)
}

export async function removeApiCacheItem(key: string): Promise<void> {
  await del(`${storageKeys.apiCachePrefix}${key}`)
}

export function createLocalForageStateStorage(): StateStorage {
  return {
    getItem: (name) => readStorageItem<string | null>(name, null),
    setItem: (name, value) => writeStorageItem(name, value),
    removeItem: (name) => removeStorageItem(name),
  }
}
