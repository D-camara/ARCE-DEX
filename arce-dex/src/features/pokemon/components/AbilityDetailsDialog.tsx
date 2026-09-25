import { useId } from 'react'
import { CloseButton, Dialog, EmptyHint } from '@/shared/ui'
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
  const titleId = useId()

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      className="max-h-[min(720px,92svh)] w-[min(560px,100%)] gap-4 overflow-y-auto rounded-[20px] border border-parchment/20 bg-ink/95 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] shadow-glow-gold backdrop-blur-2xl"
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-gold">Habilidade</p>
          <h2 id={titleId} className="text-[1.6rem] text-ivory [text-shadow:0_0_10px_rgba(255,255,255,0.1)]">
            {ability?.displayName ?? 'Carregando'}
          </h2>
        </div>
        <CloseButton label="Fechar habilidade" onClick={onClose} />
      </header>

      {isLoading && (
        <EmptyHint>Carregando descricao...</EmptyHint>
      )}
      {isError && (
        <EmptyHint>
          Não foi possível carregar esta habilidade.
        </EmptyHint>
      )}
      {!isLoading && !isError && ability && (
        <div className="grid gap-3">
          <section className="grid gap-1.5 rounded-2xl border border-line bg-surface-2 p-4">
            <h3>Efeito curto</h3>
            <p className="text-ivory-soft">{ability.shortEffect}</p>
          </section>
          <section className="grid gap-1.5 rounded-2xl border border-line bg-surface-2 p-4">
            <h3>Descrição</h3>
            <p className="text-ivory-soft">{ability.effect}</p>
          </section>
          <section className="grid gap-1.5 rounded-2xl border border-line bg-surface-2 p-4">
            <h3>Flavor text</h3>
            <p className="text-ivory-soft">{ability.flavorText}</p>
          </section>
          <span className="w-fit rounded-full bg-azure/13 px-2.5 py-1.5 text-[0.78rem] font-extrabold text-azure-100">
            {ability.generation}
          </span>
        </div>
      )}
    </Dialog>
  )
}
