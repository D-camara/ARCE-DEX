import { ArrowLeft, Eraser, Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { TeamLabAnalysis } from './TeamLabAnalysis'
import { TeamPokemonEditor } from './TeamPokemonEditor'
import { TeamSlotCard } from './TeamSlotCard'
import { usePokemon, useMoveDetails } from '@/features/pokemon'
import type { Team, TeamPokemon } from '@/shared/types/team'

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

const roleLabels: Record<string, string> = {
  '': 'Sem função',
  'physical-sweeper': 'Sweeper Físico',
  'special-sweeper': 'Sweeper Especial',
  'physical-tank': 'Tank Físico',
  'special-tank': 'Tank Especial',
  'support': 'Suporte',
  'lead': 'Lead',
  'pivot': 'Pivot',
  'wallbreaker': 'Wallbreaker',
  'hazard-setter': 'Hazard Setter',
  'hazard-remover': 'Hazard Remover',
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
  const teamMoveNames = activeTeam.slots.flatMap((slot) => slot.pokemon?.moves ?? [])
  const teamMoveDetailsQuery = useMoveDetails(teamMoveNames, [], 24)
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
        <div className="overflow-hidden rounded-[20px] border border-parchment/12 bg-ink/70 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(246,237,211,0.02)]">
          {selectedPokemon && (
            <header className="group flex items-center justify-between gap-5 border-b border-parchment/8 bg-[linear-gradient(to_bottom,rgba(246,237,211,0.03),transparent)] p-6">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="m-0 text-[0.76rem] font-bold uppercase tracking-wide text-gold">Registro de Build</p>
                <div className="mt-0.5 flex items-center gap-3">
                  <h1 className="m-0 text-[1.7rem] font-black leading-tight tracking-tight text-ivory [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
                    {selectedPokemon.displayName}
                  </h1>
                  <span className="inline-flex items-center rounded-md border border-gilt/25 bg-gilt/10 px-2 py-1 text-xs font-bold tracking-wide text-gold-soft">
                    Lv. {selectedPokemon.level ?? 100}
                  </span>
                </div>
                <p className="mt-1 text-[0.8rem] text-muted">
                  Função:{' '}
                  <span className="ml-1 inline-block rounded border border-cosmic-blue/15 bg-cosmic-blue/8 px-2 py-0.5 font-semibold text-cosmic-blue">
                    {roleLabels[selectedPokemon.role ?? ''] || 'Sem função'}
                  </span>
                </p>
              </div>
              <div className="relative flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full border border-dashed border-parchment/25 bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] p-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                <img
                  src={selectedPokemon.sprite}
                  alt={selectedPokemon.displayName}
                  className="h-[62px] w-[62px] object-contain transition-transform duration-300 [filter:drop-shadow(0_4px_8px_rgba(0,0,0,0.6))_drop-shadow(0_0_10px_rgba(212,175,55,0.35))] group-hover:rotate-3 group-hover:scale-[1.15]"
                />
              </div>
            </header>
          )}
          <TeamPokemonEditor
            abilityOptions={selectedAbilityOptions}
            fetchedBaseStats={selectedBaseStats}
            moveDetails={selectedMoveDetailsQuery.data}
            moveOptions={selectedMoveOptions}
            pokemon={selectedPokemon}
            onChange={(updates) => onUpdatePokemon(activeTeam.id, selectedSlotIndex, updates)}
          />
        </div>
      )
    }

    if (activeTab === 'Analise') {
      return <TeamLabAnalysis moveDetails={teamMoveDetailsQuery.data} team={activeTeam} />
    }

    return (
      <section className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
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
    teamMoveDetailsQuery.data,
  ])

  function handleRenameTeam() {
    const nextName = window.prompt('Novo nome do time', activeTeam.name)

    if (nextName !== null) {
      onRenameTeam(activeTeam.id, nextName)
    }
  }

  return (
    <main className="grid gap-3 mt-4 md:gap-3.5 md:mt-6">
      <section className="grid gap-3 rounded-t-3xl border border-parchment/12 border-b-0 bg-ink/70 p-6 pb-4 shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_0_30px_rgba(246,237,211,0.03)]">
        <button
          className="inline-flex w-fit min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-white/[0.04] px-3"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Pokedex
        </button>
        <div>
          <p className="text-gold">Laboratorio do Time</p>
          <h1 className="m-0 mb-2 mt-1 max-w-none bg-[linear-gradient(to_right,#FFFFFF,var(--color-ivory))] bg-clip-text text-[clamp(1.8rem,4vw,2.6rem)] font-black leading-tight tracking-tight text-transparent [overflow-wrap:anywhere]">
            {activeTeam.name}
          </h1>
          <p className="text-muted">{filledSlots}/6 slots preenchidos para edicao competitiva.</p>
        </div>
      </section>

      <section className="-mt-3 grid gap-3 rounded-b-3xl border border-parchment/12 border-t-parchment/8 bg-ink/70 p-6 pt-4 max-sm:px-4 max-sm:pb-4 shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_0_30px_rgba(246,237,211,0.02)] md:-mt-3.5">
        <div className="grid grid-cols-6 gap-2 max-xs:gap-1.5">
          {teams.map((team, index) => (
            <button
              className={
                team.id === activeTeam.id
                  ? 'min-h-11 rounded-2xl border border-gilt/30 bg-gilt/10 text-gold shadow-glow-gold'
                  : 'min-h-11 rounded-2xl border border-line bg-white/[0.04]'
              }
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

        <div className="grid grid-cols-2 gap-2">
          <button
            className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-white/[0.04] px-3"
            type="button"
            onClick={handleRenameTeam}
          >
            <Pencil size={16} />
            Renomear
          </button>
          <button
            className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-white/[0.04] px-3"
            type="button"
            onClick={() => onClearTeam(activeTeam.id)}
          >
            <Eraser size={16} />
            Limpar
          </button>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1.5" aria-label="Secoes do laboratorio">
        {labTabs
          .filter((tab) => tab !== 'Editor')
          .map((tab) => (
            <button
              className={
                tab === activeTab
                  ? 'min-h-11 whitespace-nowrap rounded-full border border-gilt/30 bg-gilt/10 px-3 text-gold shadow-glow-gold'
                  : 'min-h-11 whitespace-nowrap rounded-full border border-line bg-white/[0.04] px-3'
              }
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab === 'Analise' ? 'Análise' : tab}
            </button>
          ))}
      </nav>

      {renderedPanel}
    </main>
  )
}
