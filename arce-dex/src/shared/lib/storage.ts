import localForage from 'localforage'
import type { StateStorage } from 'zustand/middleware'

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

export function createLocalForageStateStorage(): StateStorage {
  return {
    getItem: (name) => readStorageItem<string | null>(name, null),
    setItem: (name, value) => writeStorageItem(name, value),
    removeItem: (name) => removeStorageItem(name),
  }
}
