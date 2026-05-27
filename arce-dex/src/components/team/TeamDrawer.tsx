import { Download, Eraser, Pencil, Trash2, Upload, X } from 'lucide-react'
import { TeamTransferPanel } from '../../features/import-export/TeamTransferPanel'
import type { Team } from '../../types/team'
import { TypeBadges } from '../pokemon/TypeBadges'
import { TeamAnalysisPanel, type TeamAnalysisPanelProps } from '../type-analysis/TeamAnalysisPanel'

type TeamDrawerProps = {
  isOpen: boolean
  teams: Team[]
  activeTeamId: string
  onClose: () => void
  onClearTeam: (teamId: string) => void
  onCloseTransfer: () => void
  onCopyTeam: () => void
  onImportTeam: () => void
  onImportValueChange: (value: string) => void
  onRemovePokemon: (slotIndex: number, teamId: string) => void
  onRenameTeam: (teamId: string, name: string) => void
  onSelectTeam: (teamId: string) => void
  onShowTransfer: (mode: 'export' | 'import') => void
  transferMessage: string
  transferMode: 'export' | 'import' | null
  transferValue: string
  teamAnalysis: TeamAnalysisPanelProps['analysis']
}

export function TeamDrawer({
  isOpen,
  teams,
  activeTeamId,
  onClose,
  onClearTeam,
  onCloseTransfer,
  onCopyTeam,
  onImportTeam,
  onImportValueChange,
  onRemovePokemon,
  onRenameTeam,
  onSelectTeam,
  onShowTransfer,
  transferMessage,
  transferMode,
  transferValue,
  teamAnalysis,
}: TeamDrawerProps) {
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]

  function handleRenameTeam() {
    const nextName = window.prompt('Novo nome do time', activeTeam.name)

    if (nextName !== null) {
      onRenameTeam(activeTeam.id, nextName)
    }
  }

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
        {activeTeam.slots.map((slot, index) =>
          slot.pokemon ? (
            <article className="team-slot is-filled" key={slot.id}>
              <img src={slot.pokemon.sprite} alt="" />
              <div>
                <strong>{slot.pokemon.displayName}</strong>
                <TypeBadges compact types={slot.pokemon.types} />
              </div>
              <button
                className="icon-action"
                type="button"
                onClick={() => onRemovePokemon(index, activeTeam.id)}
              >
                <Trash2 size={16} />
                <span className="sr-only">Remover</span>
              </button>
            </article>
          ) : (
            <article className="team-slot" key={slot.id}>
              <span>{index + 1}</span>
              <p>Slot vazio</p>
            </article>
          ),
        )}
      </div>

      <div className="drawer-actions">
        <button type="button" onClick={handleRenameTeam}>
          <Pencil size={16} />
          Renomear
        </button>
        <button type="button" onClick={() => onClearTeam(activeTeam.id)}>
          <Eraser size={16} />
          Limpar
        </button>
        <button type="button" onClick={() => onShowTransfer('export')}>
          <Download size={16} />
          Exportar time
        </button>
        <button type="button" onClick={() => onShowTransfer('import')}>
          <Upload size={16} />
          Importar time
        </button>
      </div>

      <div className="drawer-analysis">
        <TeamAnalysisPanel analysis={teamAnalysis} />
      </div>

      {transferMode && (
        <div className="drawer-transfer">
          <TeamTransferPanel
            exportValue={transferValue}
            importMessage={transferMessage}
            mode={transferMode}
            onClose={onCloseTransfer}
            onCopy={onCopyTeam}
            onImport={onImportTeam}
            onImportValueChange={onImportValueChange}
          />
        </div>
      )}
    </aside>
  )
}
