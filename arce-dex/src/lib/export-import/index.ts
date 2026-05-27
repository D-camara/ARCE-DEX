export function exportJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export function importJson<T>(value: string) {
  return JSON.parse(value) as T
}
