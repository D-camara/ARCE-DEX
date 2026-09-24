import { useCallback, useEffect, useRef, useState } from 'react'
import { parseUrlState, serializeUrlState, type UrlState } from './urlState'

type HistoryMode = 'push' | 'replace'

/**
 * Keeps the navigable UI state in the query string.
 * `push` adds a history entry (the back button undoes it), `replace` doesn't.
 * Updates in the same tick (one click often sets pokemon + view + tab) become a single
 * history write — push wins over replace — so "back" never needs two presses.
 */
export function useUrlState() {
  const [state, setState] = useState<UrlState>(() => parseUrlState(window.location.search))
  const stateRef = useRef(state)
  const pendingMode = useRef<HistoryMode | null>(null)

  useEffect(() => {
    const handlePopState = () => {
      const next = parseUrlState(window.location.search)
      stateRef.current = next
      setState(next)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const update = useCallback((patch: Partial<UrlState>, mode: HistoryMode) => {
    const next = { ...stateRef.current, ...patch }
    stateRef.current = next
    setState(next)

    const isFirstInTick = pendingMode.current === null
    pendingMode.current = pendingMode.current === 'push' || mode === 'push' ? 'push' : 'replace'

    if (!isFirstInTick) {
      return
    }

    queueMicrotask(() => {
      const historyMode = pendingMode.current
      pendingMode.current = null

      const search = serializeUrlState(stateRef.current)
      if (search === window.location.search) {
        return
      }

      const url = `${window.location.pathname}${search}${window.location.hash}`
      if (historyMode === 'push') {
        window.history.pushState(null, '', url)
      } else {
        window.history.replaceState(null, '', url)
      }
    })
  }, [])

  return { state, update }
}
