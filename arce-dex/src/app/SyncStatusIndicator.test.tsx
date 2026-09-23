import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { useSyncStatusStore } from './cloudSync/syncStatusStore'

afterEach(() => {
  useSyncStatusStore.getState().reset()
})

describe('SyncStatusIndicator', () => {
  it.each([
    [{}, 'Sincronizado'],
    [{ favorites: 'syncing' }, 'Sincronizando…'],
    [{ favorites: 'idle', teams: 'offline' }, 'Sem conexão — as mudanças sobem quando voltar'],
    [{ favorites: 'offline', teams: 'error' }, 'Erro ao sincronizar — tentando de novo'],
  ] as const)('shows the right label for %o', (statuses, label) => {
    useSyncStatusStore.setState({ statuses: { ...statuses } })

    render(<SyncStatusIndicator />)

    expect(screen.getByRole('status', { name: label })).toBeInTheDocument()
  })
})
