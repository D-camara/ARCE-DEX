import { Package, Pencil, Trash2 } from 'lucide-react'
import type { TeamSlot } from '@/shared/types/team'
import { TypeBadges } from '@/features/pokemon'

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
      <article className="grid min-h-[112px] grid-cols-[50px_minmax(0,1fr)] gap-3 rounded-2xl border border-line bg-surface-2 p-3">
        <span className="grid h-[42px] w-[42px] place-items-center rounded-2xl border border-dashed border-parchment/20 bg-parchment/3 text-muted">
          {slotIndex + 1}
        </span>
        <div>
          <strong>Slot vazio</strong>
          <p className="text-muted">Adicione um Pokemon pela busca principal.</p>
        </div>
      </article>
    )
  }

  return (
    <article
      className={
        isSelected
          ? 'relative grid min-h-[112px] grid-cols-[50px_minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl border border-gilt/40 bg-gilt/8 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_0_20px_rgba(212,175,55,0.05)]'
          : 'relative grid min-h-[112px] grid-cols-[50px_minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl border border-line bg-surface-2 p-3'
      }
    >
      <img
        src={slot.pokemon.sprite}
        alt=""
        className="h-[54px] w-[54px] object-contain [filter:drop-shadow(0_4px_6px_rgba(0,0,0,0.5))_drop-shadow(0_0_10px_rgba(212,175,55,0.2))]"
      />
      <div className="relative z-[1] min-w-0">
        <strong>{slot.pokemon.displayName}</strong>
        <TypeBadges compact types={slot.pokemon.types} />
        <dl className="mt-2.5 grid grid-cols-[repeat(auto-fit,minmax(86px,1fr))] gap-2">
          <div className="min-w-0 rounded-xl border border-parchment/5 bg-panel/60 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <dt className="m-0 truncate text-[0.72rem] text-muted">Lv.</dt>
            <dd className="m-0 truncate text-[0.72rem]">{slot.pokemon.level ?? 50}</dd>
          </div>
          <div className="min-w-0 rounded-xl border border-parchment/5 bg-panel/60 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <dt className="m-0 truncate text-[0.72rem] text-muted">Ability</dt>
            <dd className="m-0 truncate text-[0.72rem]">{slot.pokemon.ability || 'Livre'}</dd>
          </div>
          <div className="min-w-0 rounded-xl border border-parchment/5 bg-panel/60 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <dt className="m-0 truncate text-[0.72rem] text-muted">Item</dt>
            <dd className="m-0 flex items-center gap-1.5 truncate text-[0.72rem]">
              <Package size={13} className="shrink-0 text-gold" />
              {slot.pokemon.item || 'Sem item'}
            </dd>
          </div>
        </dl>
        <p className="mt-2 truncate text-[0.76rem] text-muted">
          {slot.pokemon.role || 'Sem funcao'} · {(slot.pokemon.moves ?? []).length}/4 golpes
        </p>
      </div>
      <div className="col-[1/-1] grid grid-cols-2 gap-2">
        <button
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-line bg-parchment/4 transition-colors hover:border-parchment/25 hover:bg-parchment/8 hover:text-ivory"
          type="button"
          onClick={() => onEdit(slotIndex)}
        >
          <Pencil size={15} />
          Editar
        </button>
        <button
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-line bg-parchment/4 transition-colors hover:border-parchment/25 hover:bg-parchment/8 hover:text-ivory"
          type="button"
          onClick={() => onRemove(slotIndex)}
        >
          <Trash2 size={15} />
          Remover
        </button>
      </div>
    </article>
  )
}
