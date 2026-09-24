import { describe, expect, it } from 'vitest'
import { selectOverallSyncStatus } from './syncStatusStore'

describe('selectOverallSyncStatus', () => {
  it('is idle with no domains', () => {
    expect(selectOverallSyncStatus({ statuses: {} })).toBe('idle')
  })

  it('reports the worst status across domains', () => {
    expect(selectOverallSyncStatus({ statuses: { a: 'idle', b: 'syncing' } })).toBe('syncing')
    expect(selectOverallSyncStatus({ statuses: { a: 'offline', b: 'syncing' } })).toBe('offline')
    expect(selectOverallSyncStatus({ statuses: { a: 'offline', b: 'error' } })).toBe('error')
  })
})
