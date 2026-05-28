import { ArrowLeft, Eraser, Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { TeamLabAnalysis } from '../../components/team/TeamLabAnalysis'
import { TeamPokemonEditor } from '../../components/team/TeamPokemonEditor'
import { TeamSlotCard } from '../../components/team/TeamSlotCard'
import { usePokemon } from '../../hooks/usePokemon'
import { useMoveDetails } from '../../hooks/usePokemonMoves'
import type { Team, TeamPokemon } from '../../types/team'

type TeamLabViewProps = {
  activeTeamId: string
  teams: Team[]
  onBack: () => void
  onClearTeam: (teamId: string) => void
  onRemovePokemon: (slotIndex: number, teamId: string) => void
  onRenameTeam: (teamId: string, name: string) => void
  onSelectTeam: (teamId: string) => void
  onUpdatePokemon: (
    teamId: string,
    slotIndex: number,
    updates: Partial<TeamPokemon>,
  ) => void
}

const labTabs = ['Time', 'Editor', 'Analise'] as const
type LabTab = (typeof labTabs)[number]

export function TeamLabView({
  activeTeamId,
  onBack,
  onClearTeam,
  onRemovePokemon,
  onRenameTeam,
  onSelectTeam,
  onUpdatePokemon,
  teams,
}: TeamLabViewProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<LabTab>('Time')
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]
  const selectedSlot = activeTeam.slots[selectedSlotIndex]
  const selectedPokemon = selectedSlot?.pokemon ?? null
  const selectedPokemonQuery = usePokemon(selectedPokemon?.name ?? null)
  const selectedBaseStats = selectedPokemon?.baseStats ?? selectedPokemonQuery.data?.stats
  const selectedAbilityOptions = selectedPokemonQuery.data?.abilities
  const selectedMoveOptions = selectedPokemonQuery.data?.moves
  const selectedMoveDetailsQuery = useMoveDetails(
    selectedPokemon?.moves ?? [],
    selectedMoveOptions ?? [],
  )
  const filledSlots = activeTeam.slots.filter((slot) => slot.pokemon).length

  useEffect(() => {
    if (!selectedPokemon || selectedPokemon.baseStats || !selectedPokemonQuery.data) {
      return
    }

    onUpdatePokemon(activeTeam.id, selectedSlotIndex, {
      baseStats: selectedPokemonQuery.data.stats,
      ability: selectedPokemon.ability || selectedPokemonQuery.data.abilities[0]?.name || '',
    })
  }, [activeTeam.id, onUpdatePokemon, selectedPokemon, selectedPokemonQuery.data, selectedSlotIndex])

  const renderedPanel = useMemo(() => {
    if (activeTab === 'Editor') {
      return (
        <TeamPokemonEditor
          abilityOptions={selectedAbilityOptions}
          fetchedBaseStats={selectedBaseStats}
          moveDetails={selectedMoveDetailsQuery.data}
          moveOptions={selectedMoveOptions}
          pokemon={selectedPokemon}
          onChange={(updates) => onUpdatePokemon(activeTeam.id, selectedSlotIndex, updates)}
        />
      )
    }

    if (activeTab === 'Analise') {
      return <TeamLabAnalysis team={activeTeam} />
    }

    return (
      <section className="team-lab-grid">
        {activeTeam.slots.map((slot, index) => (
          <TeamSlotCard
            isSelected={index === selectedSlotIndex}
            key={slot.id}
            onEdit={(slotIndex) => {
              setSelectedSlotIndex(slotIndex)
              setActiveTab('Editor')
            }}
            onRemove={(slotIndex) => onRemovePokemon(slotIndex, activeTeam.id)}
            slot={slot}
            slotIndex={index}
          />
        ))}
      </section>
    )
  }, [
    activeTab,
    activeTeam,
    onRemovePokemon,
    onUpdatePokemon,
    selectedAbilityOptions,
    selectedBaseStats,
    selectedMoveDetailsQuery.data,
    selectedMoveOptions,
    selectedPokemon,
    selectedSlotIndex,
  ])

  function handleRenameTeam() {
    const nextName = window.prompt('Novo nome do time', activeTeam.name)

    if (nextName !== null) {
      onRenameTeam(activeTeam.id, nextName)
    }
  }

  return (
    <main className="team-lab-view">
      <section className="team-lab-hero">
        <button className="team-lab-back" type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          Pokedex
        </button>
        <div>
          <p className="eyebrow">Laboratorio do Time</p>
          <h1>{activeTeam.name}</h1>
          <p>{filledSlots}/6 slots preenchidos para edicao competitiva.</p>
        </div>
      </section>

      <section className="team-lab-toolbar">
        <div className="team-tabs">
          {teams.map((team, index) => (
            <button
              className={team.id === activeTeam.id ? 'is-active' : ''}
              key={team.id}
              onClick={() => {
                onSelectTeam(team.id)
                setSelectedSlotIndex(0)
              }}
              type="button"
            >
              {index + 1}
            </button>
          ))}
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
        </div>
      </section>

      <nav className="lab-tab-list" aria-label="Secoes do laboratorio">
        {labTabs.map((tab) => (
          <button
            className={tab === activeTab ? 'is-active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      {renderedPanel}
    </main>
  )
}
