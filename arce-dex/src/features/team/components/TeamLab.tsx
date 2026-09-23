import { useTeamStore } from '../store/teamStore'
import { TeamLabView } from './TeamLabView'

/** Team lab wired to the team store; TeamLabView itself stays a plain props component. */
export function TeamLab({ onBack }: { onBack: () => void }) {
  const activeTeamId = useTeamStore((state) => state.activeTeamId)
  const teams = useTeamStore((state) => state.teams)
  const { setActiveTeam, removePokemon, renameTeam, clearTeam, updatePokemonInTeam } = useTeamStore.getState()

  return (
    <TeamLabView
      activeTeamId={activeTeamId}
      onBack={onBack}
      onClearTeam={clearTeam}
      onRemovePokemon={removePokemon}
      onRenameTeam={renameTeam}
      onSelectTeam={setActiveTeam}
      onUpdatePokemon={updatePokemonInTeam}
      teams={teams}
    />
  )
}
