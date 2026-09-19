import { X } from 'lucide-react'
import type { AbilityDetail } from '@/shared/types/pokemon'

type AbilityDetailsDialogProps = {
  ability: AbilityDetail | undefined
  isError: boolean
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
}

export function AbilityDetailsDialog({
  ability,
  isError,
  isLoading,
  isOpen,
  onClose,
}: AbilityDetailsDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[34] grid items-end bg-[rgba(2,6,23,0.64)] p-2.5 min-[760px]:items-center"
      role="presentation"
    >
      <section
        className="mx-auto grid max-h-[min(720px,92svh)] w-[min(560px,100%)] gap-4 overflow-y-auto rounded-[20px] border border-[rgba(246,237,211,0.2)] bg-[rgba(9,11,16,0.95)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] shadow-glow-gold backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-gold">Habilidade</p>
            <h2 className="text-[1.6rem] text-ivory [text-shadow:0_0_10px_rgba(255,255,255,0.1)]">
              {ability?.displayName ?? 'Carregando'}
            </h2>
          </div>
          <button className="icon-action" type="button" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar habilidade</span>
          </button>
        </header>

        {isLoading && (
          <p className="text-center italic tracking-wide text-muted opacity-80">Carregando descricao...</p>
        )}
        {isError && (
          <p className="text-center italic tracking-wide text-muted opacity-80">
            Nao foi possivel carregar esta habilidade.
          </p>
        )}
        {!isLoading && !isError && ability && (
          <div className="grid gap-3">
            <section className="grid gap-1.5 rounded-2xl border border-line bg-surface-2 p-4">
              <h3>Efeito curto</h3>
              <p className="text-ivory-soft">{ability.shortEffect}</p>
            </section>
            <section className="grid gap-1.5 rounded-2xl border border-line bg-surface-2 p-4">
              <h3>Descricao</h3>
              <p className="text-ivory-soft">{ability.effect}</p>
            </section>
            <section className="grid gap-1.5 rounded-2xl border border-line bg-surface-2 p-4">
              <h3>Flavor text</h3>
              <p className="text-ivory-soft">{ability.flavorText}</p>
            </section>
            <span className="w-fit rounded-full bg-[rgba(56,189,248,0.13)] px-2.5 py-1.5 text-[0.78rem] font-extrabold text-[#e0f2fe]">
              {ability.generation}
            </span>
          </div>
        )}
      </section>
    </div>
  )
}
