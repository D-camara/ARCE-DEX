import { X } from 'lucide-react'
import type { Pokemon } from '../../types/pokemon'
import type { Team } from '../../types/team'
import { TypeBadges } from '../pokemon/TypeBadges'

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
    <div className="modal-backdrop" role="presentation">
      <section className="add-team-dialog" role="dialog" aria-modal="true">
        <header>
          <div>
            <p className="eyebrow">Adicionar ao time</p>
            <h2>{pokemon.displayName}</h2>
          </div>
          <button className="icon-action" type="button" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar seletor</span>
          </button>
        </header>

        <div className="team-choice-list">
          {teams.map((team, index) => {
            const filledSlots = team.slots.filter((slot) => slot.pokemon).length
            const isFull = filledSlots >= team.slots.length

            return (
              <button
                className={team.id === selectedTeam.id ? 'team-choice is-active' : 'team-choice'}
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                type="button"
              >
                <span>{index + 1}</span>
                <strong>{team.name}</strong>
                <small>{filledSlots}/6 slots</small>
                {isFull && <em>Cheio</em>}
              </button>
            )
          })}
        </div>

        <div className="team-slot-preview">
          {selectedTeam.slots.map((slot, index) => (
            <span className={slot.pokemon ? 'is-filled' : ''} key={slot.id}>
              {slot.pokemon ? <img src={slot.pokemon.sprite} alt="" /> : index + 1}
            </span>
          ))}
        </div>

        <div className="add-team-target">
          <img src={pokemon.imageUrl} alt="" />
          <div>
            <strong>{pokemon.displayName}</strong>
            <TypeBadges compact types={pokemon.types} />
          </div>
        </div>

        <button className="primary-action" type="button" onClick={() => onConfirm(selectedTeam.id)}>
          Adicionar em {selectedTeam.name}
        </button>
      </section>
    </div>
  )
}
