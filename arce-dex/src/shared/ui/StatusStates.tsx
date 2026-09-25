import * as m from 'motion/react-m'
import { fadeRise } from './motion/tokens'

export function LoadingState() {
  return (
    <div className="min-h-[44px] rounded-2xl border border-line bg-white/[0.04] p-3 text-center text-[0.82rem] text-ivory-soft">
      Carregando dados...
    </div>
  )
}

type ErrorStateProps = {
  title?: string
  /** What the user can do about it. */
  hint?: string
  actionLabel?: string
  onAction?: () => void
}

/** Says what went wrong and offers a way out (retry, go back) instead of a dead end. */
export function ErrorState({ title = 'Não foi possível carregar.', hint, actionLabel, onAction }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="grid justify-items-center gap-2 rounded-2xl border border-danger-rose-400/30 bg-danger-rose-400/10 p-5 text-center"
    >
      <strong className="text-danger-rose-200">{title}</strong>
      {hint && <p className="text-[0.9rem] text-ivory-soft">{hint}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 inline-flex min-h-11 items-center justify-center rounded-control border border-parchment/20 bg-white/[0.06] px-4 font-bold text-ivory transition-colors hover:border-parchment/40 hover:bg-white/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="min-h-[44px] rounded-2xl border border-line bg-white/[0.04] p-3 text-center text-[0.82rem] text-ivory-soft">
      Nenhum resultado ainda.
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[74px] rounded-2xl bg-[linear-gradient(90deg,#111827,#263244,#111827)] bg-[length:200%_100%]"
    />
  )
}

export function Toast({ message = 'Ação concluída.' }: { message?: string }) {
  return (
    <m.div
      {...fadeRise}
      role="status"
      aria-live="polite"
      className="fixed inset-x-3.5 bottom-4 z-[1200] mx-auto max-w-[430px] rounded-2xl border border-gilt/30 bg-ink-blue/96 p-4 text-ivory shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_0_10px_rgba(212,175,55,0.1)] backdrop-blur-md">
      {message}
    </m.div>
  )
}
