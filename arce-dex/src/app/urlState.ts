import type { PokemonTabName } from '@/features/pokemon'
import { normalizePokemonSearch } from '@/shared/lib/utils'

export type AppViewName = 'dex' | 'team-lab'

/** The navigable part of the UI: what a shared link or the back button should restore. */
export type UrlState = {
  view: AppViewName
  pokemon: string | number
  tab: PokemonTabName
}

export const DEFAULT_URL_STATE: UrlState = { view: 'dex', pokemon: 448, tab: 'Info' }

const TAB_BY_SLUG: Record<string, PokemonTabName> = {
  info: 'Info',
  evolucao: 'Evolucao',
  golpes: 'Golpes',
  fraquezas: 'Fraquezas',
  formas: 'Formas',
}

const VIEW_SLUG: Record<AppViewName, string> = { dex: 'dex', 'team-lab': 'team' }

function parsePokemon(value: string | null): string | number {
  if (!value) {
    return DEFAULT_URL_STATE.pokemon
  }
  if (/^\d+$/.test(value.trim())) {
    const id = Number(value)
    return id > 0 ? id : DEFAULT_URL_STATE.pokemon
  }
  return normalizePokemonSearch(value) || DEFAULT_URL_STATE.pokemon
}

export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)

  return {
    view: params.get('view') === VIEW_SLUG['team-lab'] ? 'team-lab' : 'dex',
    pokemon: parsePokemon(params.get('pokemon')),
    tab: TAB_BY_SLUG[params.get('tab')?.toLowerCase() ?? ''] ?? DEFAULT_URL_STATE.tab,
  }
}

/** Defaults are left out so the plain app URL stays clean. Returns '' or '?…'. */
export function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams()

  if (state.view !== DEFAULT_URL_STATE.view) {
    params.set('view', VIEW_SLUG[state.view])
  }
  if (String(state.pokemon) !== String(DEFAULT_URL_STATE.pokemon)) {
    params.set('pokemon', String(state.pokemon))
  }
  if (state.tab !== DEFAULT_URL_STATE.tab) {
    params.set('tab', state.tab.toLowerCase())
  }

  const search = params.toString()
  return search ? `?${search}` : ''
}
