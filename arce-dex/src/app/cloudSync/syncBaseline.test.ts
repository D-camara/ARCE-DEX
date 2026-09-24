import { describe, expect, it } from 'vitest'
import { resolveOwnership } from './syncBaseline'

describe('resolveOwnership', () => {
  it('treats never-synced local data as anonymous', () => {
    expect(resolveOwnership(null, 'user-a')).toBe('anonymous-data')
  })

  it('recognizes data already synced with the same account', () => {
    expect(resolveOwnership('user-a', 'user-a')).toBe('same-user')
  })

  it('flags data synced with a different account', () => {
    expect(resolveOwnership('user-a', 'user-b')).toBe('other-user')
  })
})
