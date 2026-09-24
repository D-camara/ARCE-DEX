import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useUrlState } from './useUrlState'

const flushMicrotasks = () => act(async () => {})

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('useUrlState', () => {
  it('reads the initial state from the URL', () => {
    window.history.replaceState(null, '', '/?pokemon=garchomp&tab=golpes')

    const { result } = renderHook(() => useUrlState())

    expect(result.current.state).toMatchObject({ pokemon: 'garchomp', tab: 'Golpes' })
  })

  it('pushes a history entry when the pokemon changes', async () => {
    const { result } = renderHook(() => useUrlState())
    const lengthBefore = window.history.length

    act(() => result.current.update({ pokemon: 'pikachu' }, 'push'))
    await flushMicrotasks()

    expect(window.location.search).toBe('?pokemon=pikachu')
    expect(window.history.length).toBe(lengthBefore + 1)
  })

  it('replaces instead of pushing when only the tab changes', async () => {
    const { result } = renderHook(() => useUrlState())
    const lengthBefore = window.history.length

    act(() => result.current.update({ tab: 'Fraquezas' }, 'replace'))
    await flushMicrotasks()

    expect(window.location.search).toBe('?tab=fraquezas')
    expect(window.history.length).toBe(lengthBefore)
  })

  it('collapses several updates in one tick into a single history entry', async () => {
    const { result } = renderHook(() => useUrlState())
    const lengthBefore = window.history.length

    act(() => {
      result.current.update({ pokemon: 'pikachu' }, 'push')
      result.current.update({ view: 'dex' }, 'push')
      result.current.update({ tab: 'Info' }, 'replace')
    })
    await flushMicrotasks()

    expect(window.history.length).toBe(lengthBefore + 1)
  })

  it('restores state on popstate (back button)', async () => {
    const { result } = renderHook(() => useUrlState())

    window.history.pushState(null, '', '/?pokemon=mew')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(result.current.state.pokemon).toBe('mew')
  })
})
