import { Eraser, Pencil, Trash2, X } from 'lucide-react'
import type { TeamMock } from '../../features/mockPokemonData'
import { TypeBadges } from '../pokemon/TypeBadges'

type TeamDrawerProps = {
  isOpen: boolean
  teams: TeamMock[]
  activeTeamId: string
  onClose: () => void
  onSelectTeam: (teamId: string) => void
}

export function TeamDrawer({
  isOpen,
  teams,
  activeTeamId,
  onClose,
  onSelectTeam,
}: TeamDrawerProps) {
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]

  return (
    <aside className={isOpen ? 'team-drawer is-open' : 'team-drawer'} aria-hidden={!isOpen}>
      <div className="drawer-header">
        <div>
          <p className="eyebrow">Meu Time</p>
          <h2>{activeTeam.name}</h2>
        </div>
        <button className="icon-action" type="button" onClick={onClose}>
          <X size={18} />
          <span className="sr-only">Fechar time</span>
        </button>
      </div>

      <div className="team-tabs">
        {teams.map((team, index) => (
          <button
            className={team.id === activeTeam.id ? 'is-active' : ''}
            key={team.id}
            onClick={() => onSelectTeam(team.id)}
            type="button"
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="team-slots">
        {activeTeam.slots.map((pokemon, index) =>
          pokemon ? (
            <article className="team-slot is-filled" key={`${pokemon.id}-${index}`}>
              <img src={pokemon.imageUrl} alt="" />
              <div>
                <strong>{pokemon.name}</strong>
                <TypeBadges compact types={pokemon.types} />
              </div>
              <button className="icon-action" type="button">
                <Trash2 size={16} />
                <span className="sr-only">Remover</span>
              </button>
            </article>
          ) : (
            <article className="team-slot" key={`empty-${index}`}>
              <span>{index + 1}</span>
              <p>Slot vazio</p>
            </article>
          ),
        )}
      </div>

      <div className="drawer-actions">
        <button type="button">
          <Pencil size={16} />
          Renomear
        </button>
        <button type="button">
          <Eraser size={16} />
          Limpar
        </button>
      </div>
    </aside>
  )
}
