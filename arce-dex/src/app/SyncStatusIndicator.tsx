import { AlertTriangle, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { selectOverallSyncStatus, useSyncStatusStore, type SyncStatus } from './cloudSync/syncStatusStore'

const statusDisplay: Record<SyncStatus, { label: string; icon: typeof Cloud; className: string }> = {
  idle: { label: 'Sincronizado', icon: Cloud, className: 'text-muted' },
  syncing: { label: 'Sincronizando…', icon: RefreshCw, className: 'text-cosmic-blue animate-spin' },
  offline: { label: 'Sem conexão — as mudanças sobem quando voltar', icon: CloudOff, className: 'text-muted' },
  error: { label: 'Erro ao sincronizar — tentando de novo', icon: AlertTriangle, className: 'text-gold' },
}

export function SyncStatusIndicator() {
  const status = useSyncStatusStore(selectOverallSyncStatus)
  const { label, icon: Icon, className } = statusDisplay[status]

  return (
    <span role="status" aria-label={label} title={label} className="grid h-9 w-9 shrink-0 place-items-center">
      <Icon size={16} className={className} aria-hidden="true" />
    </span>
  )
}
