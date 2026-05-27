export function readStorageItem<T>(key: string, fallback: T): T {
  const storedValue = window.localStorage.getItem(key)

  if (!storedValue) {
    return fallback
  }

  return JSON.parse(storedValue) as T
}

export function writeStorageItem<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
