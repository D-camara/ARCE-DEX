export function decideSyncStrategy(remoteRows: unknown[]): 'push' | 'pull' {
  return remoteRows.length === 0 ? 'push' : 'pull'
}
