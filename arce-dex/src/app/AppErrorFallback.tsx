type AppErrorFallbackProps = {
  error: unknown
  resetErrorBoundary: () => void
}

export function AppErrorFallback({ error, resetErrorBoundary }: AppErrorFallbackProps) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido.'

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cosmic p-8 text-center text-ivory">
      <p className="text-lg font-semibold">Algo deu errado.</p>
      <p className="text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-control border border-line-gold px-4 py-2 text-sm text-gold"
      >
        Tentar novamente
      </button>
    </div>
  )
}
