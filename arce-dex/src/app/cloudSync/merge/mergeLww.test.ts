import { describe, expect, it } from 'vitest'
import { mergeLww, type LwwEntry } from './mergeLww'

const entry = (key: string, updatedAt: string | undefined, value = key): LwwEntry<string> => ({
  key,
  updatedAt,
  value,
})

describe('mergeLww', () => {
  it('keeps and upserts the local entry when it is newer', () => {
    const local = entry('a', '2026-01-02T00:00:00Z', 'local')
    const result = mergeLww([local], [entry('a', '2026-01-01T00:00:00Z', 'remote')])
    expect(result.merged).toEqual([local])
    expect(result.toUpsert).toEqual([local])
  })

  it('takes the remote entry when it is newer, without re-sending', () => {
    const remote = entry('a', '2026-01-02T00:00:00Z', 'remote')
    const result = mergeLww([entry('a', '2026-01-01T00:00:00Z', 'local')], [remote])
    expect(result.merged).toEqual([remote])
    expect(result.toUpsert).toEqual([])
  })

  it('resolves ties in favor of remote', () => {
    const remote = entry('a', '2026-01-01T00:00:00Z', 'remote')
    const result = mergeLww([entry('a', '2026-01-01T00:00:00Z', 'local')], [remote])
    expect(result.merged).toEqual([remote])
    expect(result.toUpsert).toEqual([])
  })

  it('upserts keys that only exist locally', () => {
    const local = entry('a', undefined)
    expect(mergeLww([local], [])).toEqual({ merged: [local], toUpsert: [local] })
  })

  it('adds keys that only exist remotely', () => {
    const remote = entry('b', '2026-01-01T00:00:00Z')
    expect(mergeLww([], [remote])).toEqual({ merged: [remote], toUpsert: [] })
  })

  it('treats an invalid timestamp as the oldest write', () => {
    const remote = entry('a', '1970-01-01T00:00:00.001Z', 'remote')
    const result = mergeLww([entry('a', 'not-a-date', 'local')], [remote])
    expect(result.merged).toEqual([remote])
  })
})
