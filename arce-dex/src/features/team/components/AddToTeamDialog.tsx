import { X } from 'lucide-react'
import type { Pokemon } from '@/shared/types/pokemon'
import type { Team } from '@/shared/types/team'
import { TypeBadges } from '@/features/pokemon/components/TypeBadges'

type AddToTeamDialogProps = {
  isOpen: boolean
  pokemon: Pokemon | undefined
  teams: Team[]
  selectedTeamId: string
  onClose: () => void
  onSelectTeam: (teamId: string) => void
  onConfirm: (teamId: string) => void
}

export function AddToTeamDialog({
  isOpen,
  pokemon,
  teams,
  selectedTeamId,
  onClose,
  onConfirm,
  onSelectTeam,
}: AddToTeamDialogProps) {
  if (!isOpen || !pokemon) {
    return null
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0]

  return (
    <div
      className="fixed inset-0 z-[34] grid items-end bg-[rgba(2,6,23,0.64)] p-2.5 min-[760px]:items-center"
      role="presentation"
    >
      <section
        className="mx-auto grid max-h-[min(760px,92svh)] w-[min(520px,100%)] gap-3.5 overflow-y-auto rounded-2xl border border-line bg-[rgba(9,13,20,0.98)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-gold">Adicionar ao time</p>
            <h2>{pokemon.displayName}</h2>
          </div>
          <button className="icon-action" type="button" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar seletor</span>
          </button>
        </header>

        <div className="grid gap-2.5">
          {teams.map((team, index) => {
            const filledSlots = team.slots.filter((slot) => slot.pokemon).length
            const isFull = filledSlots >= team.slots.length

            return (
              <button
                className={
                  team.id === selectedTeam.id
                    ? 'grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-[rgba(56,189,248,0.62)] bg-[rgba(56,189,248,0.14)] p-2.5 text-left text-ivory'
                    : 'grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-line bg-white/[0.04] p-2.5 text-left text-ivory'
                }
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                type="button"
              >
                <span className="grid h-[34px] w-[34px] place-items-center rounded-xl bg-white/[0.06]">
                  {index + 1}
                </span>
                <strong className="min-w-0 [overflow-wrap:anywhere]">{team.name}</strong>
                <small className="text-[0.72rem] text-muted">{filledSlots}/6 slots</small>
                {isFull && <em className="col-[2/-1] not-italic text-[#fecdd3]">Cheio</em>}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {selectedTeam.slots.map((slot, index) => (
            <span
              className={
                slot.pokemon
                  ? 'grid aspect-square place-items-center rounded-xl border border-solid border-line bg-white/[0.06] text-muted'
                  : 'grid aspect-square place-items-center rounded-xl border border-dashed border-line bg-white/[0.06] text-muted'
              }
              key={slot.id}
            >
              {slot.pokemon ? (
                <img src={slot.pokemon.sprite} alt="" className="h-full w-full object-contain" />
              ) : (
                index + 1
              )}
            </span>
          ))}
        </div>

        <div className="flex w-full items-center gap-2.5 rounded-2xl border border-line bg-white/[0.04] p-2.5 text-left">
          <img src={pokemon.imageUrl} alt="" className="h-11 w-11 object-contain" />
          <div className="min-w-0 flex-1">
            <strong>{pokemon.displayName}</strong>
            <TypeBadges compact types={pokemon.types} />
          </div>
        </div>

        <button
          className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-control border border-[rgba(56,189,248,0.42)] bg-[rgba(56,189,248,0.16)] px-3.5 font-extrabold text-ivory"
          type="button"
          onClick={() => onConfirm(selectedTeam.id)}
        >
          Adicionar em {selectedTeam.name}
        </button>
      </section>
    </div>
  )
}
