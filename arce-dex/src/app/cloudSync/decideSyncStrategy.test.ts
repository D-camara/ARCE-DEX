import { describe, expect, it } from 'vitest'
import { decideSyncStrategy } from './decideSyncStrategy'

describe('decideSyncStrategy', () => {
  it('returns push when there are no remote rows (first sync)', () => {
    expect(decideSyncStrategy([])).toBe('push')
  })

  it('returns pull when remote rows already exist', () => {
    expect(decideSyncStrategy([{ id: 1 }])).toBe('pull')
  })
})
