import * as m from 'motion/react-m'
import { fadeRise } from './motion/tokens'

export function LoadingState() {
  return (
    <div className="min-h-[44px] rounded-2xl border border-line bg-white/[0.04] p-3 text-center text-[0.82rem] text-ivory-soft">
      Carregando dados...
    </div>
  )
}

export function ErrorState() {
  return (
    <div className="min-h-[44px] rounded-2xl border border-line bg-danger-rose-400/12 p-3 text-center text-[0.82rem] text-danger-rose-200">
      Nao foi possivel carregar.
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

export function Toast({ message = 'Acao concluida.' }: { message?: string }) {
  return (
    <m.div
      {...fadeRise}
      role="status"
      aria-live="polite"
      className="fixed inset-x-3.5 bottom-4 z-40 mx-auto max-w-[430px] rounded-2xl border border-gilt/30 bg-ink-blue/96 p-4 text-ivory shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_0_10px_rgba(212,175,55,0.1)] backdrop-blur-md">
      {message}
    </m.div>
  )
}
