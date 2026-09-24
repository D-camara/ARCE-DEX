import { useState } from 'react'
import { Heart, Info, Plus, ShieldCheck, Sparkles, Volume2 } from 'lucide-react'
import type { Pokemon, PokemonStatName } from '@/shared/types/pokemon'
import { TypeBadges } from './TypeBadges'

type PokemonCardProps = {
  pokemon: Pokemon
  isFavorite: boolean
  onAddToTeam: () => void
  onPlayCry: () => void
  onSelectAbility: (abilityName: string) => void
  onToggleFavorite: () => void
}

const statLabels: Record<PokemonStatName, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'Spe',
}

export function PokemonCard({
  pokemon,
  isFavorite,
  onAddToTeam,
  onPlayCry,
  onSelectAbility,
  onToggleFavorite,
}: PokemonCardProps) {
  const [isShiny, setIsShiny] = useState(false)
  const displayedSprite = isShiny && pokemon.shinySprite ? pokemon.shinySprite : pokemon.imageUrl

  return (
    <article className="grid overflow-hidden rounded-t-3xl border border-parchment/12 bg-ink/70 shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_0_30px_rgba(246,237,211,0.03)] lg:grid-cols-[minmax(280px,40%)_1fr]">
      <div className="relative grid place-items-center border-b border-parchment/5 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_70%),rgba(5,7,12,0.5)] p-6 px-4 lg:border-b-0 lg:border-r lg:p-8">
        <div className="absolute left-1/2 top-1/2 z-0 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 animate-[pulse-aura_6s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_60%)] shadow-[0_0_60px_rgba(212,175,55,0.12)] lg:h-[270px] lg:w-[270px]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          {displayedSprite ? (
            <img
              src={displayedSprite}
              alt={pokemon.displayName}
              className="h-[130px] w-auto object-contain [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.9))_drop-shadow(0_0_40px_rgba(212,175,55,0.4))] transition-transform duration-500 hover:-translate-y-1.5 hover:scale-105 lg:h-[240px]"
            />
          ) : (
            <span
              className="grid aspect-square w-[130px] place-items-center rounded-full border border-dashed border-gilt/30 text-5xl font-extrabold text-gilt/60"
              aria-hidden
            >
              ?
            </span>
          )}
          <div className="flex gap-3">
            {pokemon.shinySprite && (
              <button
                className={
                  isShiny
                    ? 'inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-parchment bg-[linear-gradient(135deg,#D4AF37,#F6EDD3)] text-cosmic backdrop-blur-md transition-all hover:-translate-y-0.5'
                    : 'inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-parchment/20 bg-white/5 text-ivory backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-gilt/50 hover:bg-white/10 hover:shadow-glow-gold'
                }
                onClick={() => setIsShiny((value) => !value)}
                type="button"
                title={isShiny ? 'Mostrar normal' : 'Mostrar shiny'}
              >
                <Sparkles size={18} />
              </button>
            )}
            {pokemon.cryUrl && (
              <button
                className="inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-parchment/20 bg-white/5 text-ivory backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-gilt/50 hover:bg-white/10 hover:shadow-glow-gold"
                onClick={onPlayCry}
                type="button"
                title="Ouvir cry"
              >
                <Volume2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4 p-5 lg:p-6">
        <header className="flex flex-col gap-1.5">
          <p className="text-[0.9rem] font-bold uppercase tracking-[0.2em] text-gold">
            Nº {String(pokemon.id).padStart(4, '0')}
          </p>
          <h2 className="m-0 bg-[linear-gradient(to_right,#FFFFFF,var(--color-ivory))] bg-clip-text text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-tight tracking-tight text-transparent [text-shadow:0_4px_15px_rgba(255,255,255,0.1)]">
            {pokemon.displayName}
          </h2>
          <TypeBadges types={pokemon.types} />
        </header>

        <div className="grid gap-4">
          <dl className="m-0 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5 rounded-xl border border-parchment/10 bg-panel/50 p-2.5 px-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-gold">Altura</dt>
              <dd className="m-0 text-[1.1rem] font-extrabold text-ivory">{(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-parchment/10 bg-panel/50 p-2.5 px-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-gold">Peso</dt>
              <dd className="m-0 text-[1.1rem] font-extrabold text-ivory">{(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
          </dl>

          <AbilityList abilities={pokemon.abilities} onSelectAbility={onSelectAbility} />
        </div>

        <div className="grid gap-2 rounded-2xl border border-parchment/10 bg-panel/50 p-3 px-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
          {Object.entries(pokemon.stats).map(([name, value]) => (
            <StatBar key={name} label={statLabels[name as PokemonStatName]} value={value} />
          ))}
        </div>

        <div className="mt-2 flex gap-3">
          <button
            className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gilt/40 bg-[linear-gradient(135deg,rgba(212,175,55,0.2),rgba(246,237,211,0.05))] text-[0.9rem] font-extrabold uppercase tracking-wide text-ivory shadow-[0_6px_15px_rgba(0,0,0,0.4),inset_0_0_10px_rgba(212,175,55,0.1)] transition-all hover:-translate-y-0.5 hover:border-gilt/70 hover:bg-[linear-gradient(135deg,rgba(212,175,55,0.3),rgba(246,237,211,0.1))] hover:text-white hover:shadow-glow-gold"
            type="button"
            onClick={onAddToTeam}
          >
            <Plus size={20} />
            Adicionar à Equipe
          </button>
          <button
            className={
              isFavorite
                ? 'inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-gilt/50 bg-gilt/15 text-gilt shadow-glow-gold transition-all hover:-translate-y-0.5'
                : 'inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-parchment/15 bg-white/5 text-ivory-soft transition-all hover:-translate-y-0.5 hover:border-parchment/30 hover:bg-white/10 hover:text-ivory'
            }
            type="button"
            onClick={onToggleFavorite}
          >
            <Heart fill={isFavorite ? 'currentColor' : 'none'} size={20} />
            <span className="sr-only">Favoritar</span>
          </button>
          <button
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-parchment/15 bg-white/5 text-ivory-soft transition-all hover:-translate-y-0.5 hover:border-parchment/30 hover:bg-white/10 hover:text-ivory"
            type="button"
          >
            <ShieldCheck size={20} />
            <span className="sr-only">Analisar</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function AbilityList({
  abilities,
  onSelectAbility,
}: {
  abilities: Pokemon['abilities']
  onSelectAbility: (abilityName: string) => void
}) {
  return (
    <section className="flex flex-wrap gap-2" aria-label="Habilidades">
      {abilities.map((ability) => (
        <button
          key={ability.name}
          onClick={() => onSelectAbility(ability.name)}
          type="button"
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 py-2 text-ivory shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all hover:border-gold hover:bg-gilt/10 hover:text-gold hover:shadow-glow-gold"
        >
          {ability.displayName}
          <Info size={13} />
        </button>
      ))}
    </section>
  )
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[34px_1fr_34px] items-center gap-2 text-[0.82rem] text-ivory-soft">
      <span>{label}</span>
      <div className="h-[9px] overflow-hidden rounded-full bg-white/[0.08]">
        <i
          className="block h-full rounded-[inherit] bg-[linear-gradient(90deg,var(--color-gold),var(--color-cosmic-blue))]"
          style={{ width: `${Math.min(value, 150) / 1.5}%` }}
        />
      </div>
      <strong>{value}</strong>
    </div>
  )
}
