import { Package, Pencil, Trash2 } from 'lucide-react'
import type { TeamSlot } from '../../types/team'
import { TypeBadges } from '../pokemon/TypeBadges'

type TeamSlotCardProps = {
  isSelected: boolean
  slot: TeamSlot
  slotIndex: number
  onEdit: (slotIndex: number) => void
  onRemove: (slotIndex: number) => void
}

export function TeamSlotCard({
  isSelected,
  onEdit,
  onRemove,
  slot,
  slotIndex,
}: TeamSlotCardProps) {
  if (!slot.pokemon) {
    return (
      <article className="team-lab-slot">
        <span className="slot-number">{slotIndex + 1}</span>
        <div>
          <strong>Slot vazio</strong>
          <p>Adicione um Pokemon pela busca principal.</p>
        </div>
      </article>
    )
  }

  return (
    <article className={isSelected ? 'team-lab-slot is-selected' : 'team-lab-slot'}>
      <img src={slot.pokemon.sprite} alt="" />
      <div>
        <strong>{slot.pokemon.displayName}</strong>
        <TypeBadges compact types={slot.pokemon.types} />
        <dl className="slot-meta">
          <div>
            <dt>Lv.</dt>
            <dd>{slot.pokemon.level ?? 50}</dd>
          </div>
          <div>
            <dt>Ability</dt>
            <dd>{slot.pokemon.ability || 'Livre'}</dd>
          </div>
          <div>
            <dt>Item</dt>
            <dd className="slot-item-value">
              <Package size={13} />
              {slot.pokemon.item || 'Sem item'}
            </dd>
          </div>
        </dl>
        <p className="slot-build-copy">
          {slot.pokemon.role || 'Sem funcao'} · {(slot.pokemon.moves ?? []).length}/4 golpes
        </p>
      </div>
      <div className="slot-actions">
        <button type="button" onClick={() => onEdit(slotIndex)}>
          <Pencil size={15} />
          Editar
        </button>
        <button type="button" onClick={() => onRemove(slotIndex)}>
          <Trash2 size={15} />
          Remover
        </button>
      </div>
    </article>
  )
}
