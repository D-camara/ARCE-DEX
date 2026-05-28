import { X } from 'lucide-react'
import type { AbilityDetail } from '../../types/pokemon'

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
    <div className="modal-backdrop" role="presentation">
      <section className="ability-dialog" role="dialog" aria-modal="true">
        <header>
          <div>
            <p className="eyebrow">Habilidade</p>
            <h2>{ability?.displayName ?? 'Carregando'}</h2>
          </div>
          <button className="icon-action" type="button" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar habilidade</span>
          </button>
        </header>

        {isLoading && <p className="empty-copy">Carregando descricao...</p>}
        {isError && <p className="empty-copy">Nao foi possivel carregar esta habilidade.</p>}
        {!isLoading && !isError && ability && (
          <div className="ability-detail-content">
            <section>
              <h3>Efeito curto</h3>
              <p>{ability.shortEffect}</p>
            </section>
            <section>
              <h3>Descricao</h3>
              <p>{ability.effect}</p>
            </section>
            <section>
              <h3>Flavor text</h3>
              <p>{ability.flavorText}</p>
            </section>
            <span>{ability.generation}</span>
          </div>
        )}
      </section>
    </div>
  )
}
