export function LoadingState() {
  return <div className="status-state">Carregando dados...</div>
}

export function ErrorState() {
  return <div className="status-state status-state--error">Nao foi possivel carregar.</div>
}

export function EmptyState() {
  return <div className="status-state">Nenhum resultado ainda.</div>
}

export function SkeletonCard() {
  return <div className="skeleton-card" aria-hidden="true" />
}

export function Toast({ message = 'Acao concluida.' }: { message?: string }) {
  return <div className="toast">{message}</div>
}
