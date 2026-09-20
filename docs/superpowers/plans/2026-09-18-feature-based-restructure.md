# Feature-Based Restructure (Fase 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `arce-dex/src` from technical-layer folders (`components/`, `features/`, `hooks/`, `stores/`, `lib/`, `services/`, `types/` all flat under `src/`) into a feature-based structure (`features/pokemon`, `features/search`, `features/team`, `features/favorites`, `features/type-analysis`, `shared/*`), with zero behavior change.

**Architecture:** Two-step approach per task group: (1) introduce a `@/` TypeScript path alias so imports don't depend on relative folder depth, converting all existing imports to it once up front; (2) move each feature's files with `git mv` (preserves history) and fix the now-easy string-based `@/old/path` → `@/new/path` references. Every task ends green on `npm run build`, `npm run lint`, `npm run test`.

**Tech Stack:** Vite (`resolve.alias`), TypeScript (`compilerOptions.paths`), no new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-18-stack-improvements-design.md` (Fase 0 section)

## Global Constraints

- No behavior change: this plan only moves/renames files and fixes imports. No component logic, store logic, or JSX changes.
- Preserve all current functionality (search, favorites, team builder, history) — verified by `npm run build && npm run lint && npm run test` passing after every task.
- Use `git mv` (not delete+recreate) so file history is preserved.
- Work happens inside `arce-dex/` (the Vite project root); all paths below are relative to `arce-dex/` unless stated otherwise.
- Order: `favorites` → `type-analysis` → `search` → `team` → `pokemon` → `shared` → barrel/App.tsx cleanup, per the spec's stated risk ordering.

---

### Task 1: Add `@/` path alias and convert all imports to it

**Files:**
- Modify: `tsconfig.app.json`
- Modify: `vite.config.ts`
- Modify: every `.ts`/`.tsx` file under `src/` that has a relative import crossing into `components/`, `features/`, `hooks/`, `stores/`, `lib/`, `services/`, or `types/` (full list below)

**Interfaces:**
- Produces: `@/*` resolves to `src/*` in both TypeScript and Vite. All subsequent tasks write imports as `@/features/...` or `@/shared/...` instead of relative paths.

- [ ] **Step 1: Add the path alias to `tsconfig.app.json`**

Edit `tsconfig.app.json`, inside `compilerOptions` add:

```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
```

- [ ] **Step 2: Add the alias to `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Verify the alias resolves before touching any imports**

In `src/main.tsx`, temporarily change the App import to use the alias, then build:

Run: `npm run build`
Expected: build succeeds (confirms both `tsc` and `vite` resolve `@/`). If it fails, fix `tsconfig.app.json`/`vite.config.ts` before continuing — do not proceed to file moves on a broken alias.

- [ ] **Step 4: Convert every relative cross-folder import to `@/...`**

Replace every import listed below (exact current line → new line). These are every relative import in the codebase that crosses from one top-level `src/` folder into another (intra-folder relative imports, e.g. `./TeamLabView`, are untouched):

`src/hooks/useAbility.ts`:
```diff
-import { getAbility } from '../services/pokeapi/endpoints'
-import { mapAbilityDetail } from '../services/pokeapi/mappers'
+import { getAbility } from '@/services/pokeapi/endpoints'
+import { mapAbilityDetail } from '@/services/pokeapi/mappers'
```

`src/hooks/usePokemonForms.ts`:
```diff
-import { findPokemon } from '../services/pokeapi/endpoints'
-import { mapPokemonDetail } from '../services/pokeapi/mappers'
-import { normalizePokemonSearch } from '../lib/utils'
+import { findPokemon } from '@/services/pokeapi/endpoints'
+import { mapPokemonDetail } from '@/services/pokeapi/mappers'
+import { normalizePokemonSearch } from '@/lib/utils'
```

`src/hooks/usePokemon.ts`:
```diff
-import { findPokemon } from '../services/pokeapi/endpoints'
-import { mapPokemonDetail } from '../services/pokeapi/mappers'
-import { normalizePokemonSearch } from '../lib/utils'
+import { findPokemon } from '@/services/pokeapi/endpoints'
+import { mapPokemonDetail } from '@/services/pokeapi/mappers'
+import { normalizePokemonSearch } from '@/lib/utils'
```

`src/hooks/useTypeAnalysis.ts`:
```diff
-import type { PokemonTypeName } from '../types/pokemon'
-import { calculateTypeAnalysis } from '../lib/type-chart'
+import type { PokemonTypeName } from '@/types/pokemon'
+import { calculateTypeAnalysis } from '@/lib/type-chart'
```

`src/hooks/useMovesDetails.ts`:
```diff
-import { getMove } from '../services/pokeapi/endpoints'
-import { mapMoveDetail } from '../services/pokeapi/mappers'
-import type { PokemonMove } from '../types/pokemon'
+import { getMove } from '@/services/pokeapi/endpoints'
+import { mapMoveDetail } from '@/services/pokeapi/mappers'
+import type { PokemonMove } from '@/types/pokemon'
```

`src/hooks/usePokemonSummaries.ts`:
```diff
-import { getPokemon } from '../services/pokeapi/endpoints'
-import { mapPokemonSummary } from '../services/pokeapi/mappers'
-import { normalizePokemonSearch } from '../lib/utils'
+import { getPokemon } from '@/services/pokeapi/endpoints'
+import { mapPokemonSummary } from '@/services/pokeapi/mappers'
+import { normalizePokemonSearch } from '@/lib/utils'
```

`src/hooks/usePokemonSpecies.ts`:
```diff
-import { findPokemonSpecies } from '../services/pokeapi/endpoints'
-import { mapPokemonSpecies } from '../services/pokeapi/mappers'
-import { normalizePokemonSearch } from '../lib/utils'
+import { findPokemonSpecies } from '@/services/pokeapi/endpoints'
+import { mapPokemonSpecies } from '@/services/pokeapi/mappers'
+import { normalizePokemonSearch } from '@/lib/utils'
```

`src/hooks/usePokemonMoves.ts`:
```diff
-import { findPokemon, getMove } from '../services/pokeapi/endpoints'
-import { mapMoveDetail, mapPokemonDetail } from '../services/pokeapi/mappers'
-import { normalizePokemonSearch } from '../lib/utils'
-import type { MoveDetail, PokemonMove } from '../types/pokemon'
+import { findPokemon, getMove } from '@/services/pokeapi/endpoints'
+import { mapMoveDetail, mapPokemonDetail } from '@/services/pokeapi/mappers'
+import { normalizePokemonSearch } from '@/lib/utils'
+import type { MoveDetail, PokemonMove } from '@/types/pokemon'
```

`src/hooks/usePokemonList.ts`:
```diff
-import { getPokemon, getPokemonList } from '../services/pokeapi/endpoints'
-import { mapPokemonListResource, mapPokemonSummary } from '../services/pokeapi/mappers'
+import { getPokemon, getPokemonList } from '@/services/pokeapi/endpoints'
+import { mapPokemonListResource, mapPokemonSummary } from '@/services/pokeapi/mappers'
```

`src/hooks/useEvolutionChain.ts`:
```diff
-import { getEvolutionChain, getEvolutionChainByUrl } from '../services/pokeapi/endpoints'
-import { mapEvolutionChain } from '../services/pokeapi/mappers'
+import { getEvolutionChain, getEvolutionChainByUrl } from '@/services/pokeapi/endpoints'
+import { mapEvolutionChain } from '@/services/pokeapi/mappers'
```

`src/features/team-builder/TeamLabView.tsx`:
```diff
-import { TeamLabAnalysis } from '../../components/team/TeamLabAnalysis'
-import { TeamPokemonEditor } from '../../components/team/TeamPokemonEditor'
-import { TeamSlotCard } from '../../components/team/TeamSlotCard'
-import { usePokemon } from '../../hooks/usePokemon'
-import { useMoveDetails } from '../../hooks/usePokemonMoves'
-import type { Team, TeamPokemon } from '../../types/team'
+import { TeamLabAnalysis } from '@/components/team/TeamLabAnalysis'
+import { TeamPokemonEditor } from '@/components/team/TeamPokemonEditor'
+import { TeamSlotCard } from '@/components/team/TeamSlotCard'
+import { usePokemon } from '@/hooks/usePokemon'
+import { useMoveDetails } from '@/hooks/usePokemonMoves'
+import type { Team, TeamPokemon } from '@/types/team'
```

`src/components/team/TeamSlotCard.tsx`:
```diff
-import type { TeamSlot } from '../../types/team'
+import type { TeamSlot } from '@/types/team'
```

`src/features/pokemon-search/SearchExperience.tsx`:
```diff
-import type { PokemonSummary } from '../../types/pokemon'
+import type { PokemonSummary } from '@/types/pokemon'
...
-} from '../../lib/search'
+} from '@/lib/search'
```

`src/services/pokeapi/mappers.ts`:
```diff
-} from '../../types/pokemon'
+} from '@/types/pokemon'
...
-} from '../../types/pokeapi'
-import type { TeamPokemon } from '../../types/team'
-import { formatGenerationName, formatPokemonName } from '../../lib/utils'
+} from '@/types/pokeapi'
+import type { TeamPokemon } from '@/types/team'
+import { formatGenerationName, formatPokemonName } from '@/lib/utils'
```

`src/services/pokeapi/mappers.test.ts`:
```diff
-} from '../../types/pokeapi'
+} from '@/types/pokeapi'
```

`src/services/pokeapi/endpoints.test.ts`:
```diff
-import type { PokeApiPokemonFormResponse, PokeApiPokemonResponse } from '../../types/pokeapi'
+import type { PokeApiPokemonFormResponse, PokeApiPokemonResponse } from '@/types/pokeapi'
```

`src/services/pokeapi/endpoints.ts`:
```diff
-} from '../../types/pokeapi'
-import { getPokemonSearchCandidates } from '../../lib/search'
+} from '@/types/pokeapi'
+import { getPokemonSearchCandidates } from '@/lib/search'
```

`src/components/type-analysis/TeamAnalysisPanel.tsx`:
```diff
-import type { OffensiveCoverage, TeamDefensiveTypeSummary } from '../../lib/type-chart'
-import type { PokemonTypeName } from '../../types/pokemon'
+import type { OffensiveCoverage, TeamDefensiveTypeSummary } from '@/lib/type-chart'
+import type { PokemonTypeName } from '@/types/pokemon'
```

`src/lib/hidden-power/index.ts`:
```diff
-import type { PokemonStatName, PokemonTypeName } from '../../types/pokemon'
-import type { CompetitiveStatTable } from '../../types/team'
+import type { PokemonStatName, PokemonTypeName } from '@/types/pokemon'
+import type { CompetitiveStatTable } from '@/types/team'
```

`src/features/favorites/RecentPokemonPanel.tsx`:
```diff
-import type { PokemonSummary } from '../../types/pokemon'
-import { TypeBadges } from '../../components/pokemon/TypeBadges'
+import type { PokemonSummary } from '@/types/pokemon'
+import { TypeBadges } from '@/components/pokemon/TypeBadges'
```

`src/lib/stats/index.ts`:
```diff
-import type { PokemonStatName, PokemonStats } from '../../types/pokemon'
+import type { PokemonStatName, PokemonStats } from '@/types/pokemon'
...
-} from '../../types/team'
+} from '@/types/team'
```

`src/lib/search/index.ts`:
```diff
-import type { PokemonSummary } from '../../types/pokemon'
+import type { PokemonSummary } from '@/types/pokemon'
```

`src/lib/search/index.test.ts`:
```diff
-import type { PokemonSummary } from '../../types/pokemon'
+import type { PokemonSummary } from '@/types/pokemon'
```

`src/stores/favoritesStore.ts`:
```diff
-import { createLocalForageStateStorage } from '../lib/storage'
+import { createLocalForageStateStorage } from '@/lib/storage'
```

`src/components/team/TeamPokemonEditor.tsx`:
```diff
-} from '../../types/pokemon'
-import type { CompetitiveStatTable, PokemonNature, TeamPokemon, TeamRole } from '../../types/team'
+} from '@/types/pokemon'
+import type { CompetitiveStatTable, PokemonNature, TeamPokemon, TeamRole } from '@/types/team'
...
-import { calculateHiddenPowerType } from '../../lib/hidden-power'
-import { findHeldItemOption, getCuratedHeldItems, searchHeldItemOptions } from '../../lib/items'
+import { calculateHiddenPowerType } from '@/lib/hidden-power'
+import { findHeldItemOption, getCuratedHeldItems, searchHeldItemOptions } from '@/lib/items'
...
-} from '../../lib/stats'
+} from '@/lib/stats'
```

`src/features/favorites/FavoritesPanel.tsx`:
```diff
-import type { PokemonSummary } from '../../types/pokemon'
-import { TypeBadges } from '../../components/pokemon/TypeBadges'
+import type { PokemonSummary } from '@/types/pokemon'
+import { TypeBadges } from '@/components/pokemon/TypeBadges'
```

`src/stores/searchHistoryStore.ts`:
```diff
-import { createLocalForageStateStorage } from '../lib/storage'
+import { createLocalForageStateStorage } from '@/lib/storage'
```

`src/stores/settingsStore.ts`:
```diff
-import { createLocalForageStateStorage } from '../lib/storage'
+import { createLocalForageStateStorage } from '@/lib/storage'
```

`src/lib/stats/index.test.ts`:
```diff
-import type { PokemonStats } from '../../types/pokemon'
-import type { TeamPokemon } from '../../types/team'
+import type { PokemonStats } from '@/types/pokemon'
+import type { TeamPokemon } from '@/types/team'
```

`src/features/favorites/FavoritesDrawer.tsx`:
```diff
-import type { PokemonSummary } from '../../types/pokemon'
-import { TypeBadges } from '../../components/pokemon/TypeBadges'
+import type { PokemonSummary } from '@/types/pokemon'
+import { TypeBadges } from '@/components/pokemon/TypeBadges'
```

`src/app/appDataAdapters.ts`:
```diff
-} from '../lib/type-chart'
+} from '@/lib/type-chart'
...
-} from '../types/pokemon'
-import type { Team, TeamPokemon } from '../types/team'
-import type { PokemonTabData } from '../components/pokemon/PokemonTabs'
-import { normalizeCompetitivePokemon } from '../lib/stats'
+} from '@/types/pokemon'
+import type { Team, TeamPokemon } from '@/types/team'
+import type { PokemonTabData } from '@/components/pokemon/PokemonTabs'
+import { normalizeCompetitivePokemon } from '@/lib/stats'
```

`src/stores/teamStore.ts`:
```diff
-import { normalizeCompetitivePokemon } from '../lib/stats'
-import { createLocalForageStateStorage } from '../lib/storage'
-import type { Team, TeamPokemon, TeamSlot } from '../types/team'
+import { normalizeCompetitivePokemon } from '@/lib/stats'
+import { createLocalForageStateStorage } from '@/lib/storage'
+import type { Team, TeamPokemon, TeamSlot } from '@/types/team'
```

`src/components/team/AddToTeamDialog.tsx`:
```diff
-import type { Pokemon } from '../../types/pokemon'
-import type { Team } from '../../types/team'
+import type { Pokemon } from '@/types/pokemon'
+import type { Team } from '@/types/team'
```

`src/app/App.tsx`:
```diff
-import { AbilityDetailsDialog } from '../components/pokemon/AbilityDetailsDialog'
-import { PokemonCard } from '../components/pokemon/PokemonCard'
-import { PokemonTabs, type PokemonTabName } from '../components/pokemon/PokemonTabs'
-import { AddToTeamDialog } from '../components/team/AddToTeamDialog'
-import { ErrorState, LoadingState, Toast } from '../components/ui/StatusStates'
-import { FavoritesDrawer } from '../features/favorites/FavoritesDrawer'
-import { RecentPokemonPanel } from '../features/favorites/RecentPokemonPanel'
-import { SearchExperience } from '../features/pokemon-search/SearchExperience'
-import { TeamLabView } from '../features/team-builder'
-import { normalizePokemonSearch } from '../lib/utils'
-import { getPokemonAutocompleteSuggestions } from '../lib/search'
-import { usePokemon } from '../hooks/usePokemon'
-import { useAbility } from '../hooks/useAbility'
-import { useEvolutionChain } from '../hooks/useEvolutionChain'
-import { usePokemonAutocompleteList } from '../hooks/usePokemonList'
-import { useMovesDetails } from '../hooks/useMovesDetails'
-import { usePokemonSpecies } from '../hooks/usePokemonSpecies'
-import { usePokemonSummaries } from '../hooks/usePokemonSummaries'
-import { useFavoritesStore } from '../stores/favoritesStore'
-import { useSearchHistoryStore } from '../stores/searchHistoryStore'
-import { useTeamStore } from '../stores/teamStore'
-import type { PokemonSummary } from '../types/pokemon'
+import { AbilityDetailsDialog } from '@/components/pokemon/AbilityDetailsDialog'
+import { PokemonCard } from '@/components/pokemon/PokemonCard'
+import { PokemonTabs, type PokemonTabName } from '@/components/pokemon/PokemonTabs'
+import { AddToTeamDialog } from '@/components/team/AddToTeamDialog'
+import { ErrorState, LoadingState, Toast } from '@/components/ui/StatusStates'
+import { FavoritesDrawer } from '@/features/favorites/FavoritesDrawer'
+import { RecentPokemonPanel } from '@/features/favorites/RecentPokemonPanel'
+import { SearchExperience } from '@/features/pokemon-search/SearchExperience'
+import { TeamLabView } from '@/features/team-builder'
+import { normalizePokemonSearch } from '@/lib/utils'
+import { getPokemonAutocompleteSuggestions } from '@/lib/search'
+import { usePokemon } from '@/hooks/usePokemon'
+import { useAbility } from '@/hooks/useAbility'
+import { useEvolutionChain } from '@/hooks/useEvolutionChain'
+import { usePokemonAutocompleteList } from '@/hooks/usePokemonList'
+import { useMovesDetails } from '@/hooks/useMovesDetails'
+import { usePokemonSpecies } from '@/hooks/usePokemonSpecies'
+import { usePokemonSummaries } from '@/hooks/usePokemonSummaries'
+import { useFavoritesStore } from '@/stores/favoritesStore'
+import { useSearchHistoryStore } from '@/stores/searchHistoryStore'
+import { useTeamStore } from '@/stores/teamStore'
+import type { PokemonSummary } from '@/types/pokemon'
```

`src/components/pokemon/AbilityDetailsDialog.tsx`:
```diff
-import type { AbilityDetail } from '../../types/pokemon'
+import type { AbilityDetail } from '@/types/pokemon'
```

`src/components/team/TeamLabAnalysis.tsx`:
```diff
-} from '../../lib/type-chart'
-import { calculateFinalStats } from '../../lib/stats'
-import type { MoveDetail } from '../../types/pokemon'
-import type { Team, TeamPokemon } from '../../types/team'
+} from '@/lib/type-chart'
+import { calculateFinalStats } from '@/lib/stats'
+import type { MoveDetail } from '@/types/pokemon'
+import type { Team, TeamPokemon } from '@/types/team'
```

`src/lib/type-chart/index.ts`:
```diff
-} from '../../types/pokemon'
-import type { Team, TeamPokemon } from '../../types/team'
+} from '@/types/pokemon'
+import type { Team, TeamPokemon } from '@/types/team'
```

`src/lib/items/index.ts`:
```diff
-import type { HeldItemOption } from '../../types/pokemon'
+import type { HeldItemOption } from '@/types/pokemon'
```

`src/components/pokemon/TypeBadges.tsx`:
```diff
-import type { PokemonTypeName } from '../../types/pokemon'
+import type { PokemonTypeName } from '@/types/pokemon'
```

`src/lib/type-chart/index.test.ts`:
```diff
-import type { MoveDetail } from '../../types/pokemon'
-import type { TeamPokemon } from '../../types/team'
+import type { MoveDetail } from '@/types/pokemon'
+import type { TeamPokemon } from '@/types/team'
```

`src/components/pokemon/PokemonCard.tsx`:
```diff
-import type { Pokemon, PokemonStatName } from '../../types/pokemon'
+import type { Pokemon, PokemonStatName } from '@/types/pokemon'
```

`src/components/pokemon/PokemonTabs.tsx`:
```diff
-} from '../../types/pokemon'
+} from '@/types/pokemon'
```

- [ ] **Step 5: Verify everything still builds, lints, and tests green**

Run: `npm run build && npm run lint && npm run test`
Expected: all three succeed with no errors (there should be zero remaining relative imports crossing top-level folders — a quick sanity grep: `grep -rn "from '\.\./\.\./types\|from '\.\./services\|from '\.\./lib\|from '\.\./stores\|from '\.\./components\|from '\.\./hooks" src` should return nothing).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: introduce @/ path alias and convert relative imports"
```

---

### Task 2: Move `favorites` into a feature folder

**Files:**
- Create dir: `src/features/favorites/` already exists — restructure it into `src/features/favorites/components/` and `src/features/favorites/store/`
- Move: `src/features/favorites/FavoritesDrawer.tsx` → `src/features/favorites/components/FavoritesDrawer.tsx`
- Move: `src/features/favorites/FavoritesPanel.tsx` → `src/features/favorites/components/FavoritesPanel.tsx`
- Move: `src/features/favorites/RecentPokemonPanel.tsx` → `src/features/favorites/components/RecentPokemonPanel.tsx`
- Move: `src/stores/favoritesStore.ts` → `src/features/favorites/store/favoritesStore.ts`
- Modify: `src/app/App.tsx` (import paths)

**Interfaces:**
- Consumes: `@/lib/storage` (unchanged, still shared — moves in Task 7).
- Produces: `@/features/favorites/components/FavoritesDrawer`, `@/features/favorites/components/FavoritesPanel`, `@/features/favorites/components/RecentPokemonPanel`, `@/features/favorites/store/favoritesStore` — these exact paths are used by `App.tsx` from this task on, and will be re-exported from `@/features/favorites` in Task 8.

- [ ] **Step 1: Move the files with git mv**

```bash
git mv src/features/favorites/FavoritesDrawer.tsx src/features/favorites/components/FavoritesDrawer.tsx
git mv src/features/favorites/FavoritesPanel.tsx src/features/favorites/components/FavoritesPanel.tsx
git mv src/features/favorites/RecentPokemonPanel.tsx src/features/favorites/components/RecentPokemonPanel.tsx
mkdir -p src/features/favorites/store
git mv src/stores/favoritesStore.ts src/features/favorites/store/favoritesStore.ts
```

- [ ] **Step 2: Fix the moved files' own imports**

`src/features/favorites/components/RecentPokemonPanel.tsx`, `FavoritesPanel.tsx`, `FavoritesDrawer.tsx` each still import `TypeBadges` — no change needed, `@/components/pokemon/TypeBadges` still resolves (pokemon moves in Task 6).

`src/features/favorites/store/favoritesStore.ts` imports `@/lib/storage` — no change needed (moves in Task 7).

- [ ] **Step 3: Update consumers**

`src/app/App.tsx`:
```diff
-import { FavoritesDrawer } from '@/features/favorites/FavoritesDrawer'
-import { RecentPokemonPanel } from '@/features/favorites/RecentPokemonPanel'
+import { FavoritesDrawer } from '@/features/favorites/components/FavoritesDrawer'
+import { RecentPokemonPanel } from '@/features/favorites/components/RecentPokemonPanel'
```
```diff
-import { useFavoritesStore } from '@/stores/favoritesStore'
+import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
```

`FavoritesPanel` is consumed only where `FavoritesDrawer` renders it — check with:

Run: `grep -rn "FavoritesPanel" src --include=*.tsx`

If it's imported anywhere outside `src/features/favorites/`, update that import the same way (`@/features/favorites/FavoritesPanel` → `@/features/favorites/components/FavoritesPanel`).

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move favorites into feature folder"
```

---

### Task 3: Move `type-analysis` into a feature folder

**Files:**
- Move: `src/components/type-analysis/TeamAnalysisPanel.tsx` → `src/features/type-analysis/components/TeamAnalysisPanel.tsx`
- Move: `src/hooks/useTypeAnalysis.ts` → `src/features/type-analysis/hooks/useTypeAnalysis.ts`
- Move: `src/lib/type-chart/index.ts` → `src/features/type-analysis/lib/type-chart.ts`
- Move: `src/lib/type-chart/index.test.ts` → `src/features/type-analysis/lib/type-chart.test.ts`
- Delete: `src/components/type-analysis/index.ts` (dead `export {}` stub, superseded by Task 8's barrel), `src/features/type-calculator/index.ts` and its directory (confirmed unreferenced anywhere in `src`)
- Modify: consumers of `TeamAnalysisPanel`, `useTypeAnalysis`, `lib/type-chart`

**Interfaces:**
- Consumes: `@/types/pokemon`, `@/types/team` (unchanged, move in Task 7).
- Produces: `@/features/type-analysis/components/TeamAnalysisPanel`, `@/features/type-analysis/hooks/useTypeAnalysis`, `@/features/type-analysis/lib/type-chart` (exports `calculateTypeAnalysis`, `OffensiveCoverage`, `TeamDefensiveTypeSummary`, and whatever else `index.ts` exported).

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/features/type-analysis/components src/features/type-analysis/hooks src/features/type-analysis/lib
git mv src/components/type-analysis/TeamAnalysisPanel.tsx src/features/type-analysis/components/TeamAnalysisPanel.tsx
git mv src/hooks/useTypeAnalysis.ts src/features/type-analysis/hooks/useTypeAnalysis.ts
git mv src/lib/type-chart/index.ts src/features/type-analysis/lib/type-chart.ts
git mv src/lib/type-chart/index.test.ts src/features/type-analysis/lib/type-chart.test.ts
git rm src/components/type-analysis/index.ts
git rm -r src/features/type-calculator
```

- [ ] **Step 2: Fix the moved files' own imports**

`src/features/type-analysis/components/TeamAnalysisPanel.tsx`:
```diff
-import type { OffensiveCoverage, TeamDefensiveTypeSummary } from '@/lib/type-chart'
+import type { OffensiveCoverage, TeamDefensiveTypeSummary } from '@/features/type-analysis/lib/type-chart'
```

`src/features/type-analysis/hooks/useTypeAnalysis.ts`:
```diff
-import { calculateTypeAnalysis } from '@/lib/type-chart'
+import { calculateTypeAnalysis } from '@/features/type-analysis/lib/type-chart'
```

`src/features/type-analysis/lib/type-chart.ts` and `type-chart.test.ts`: imports are only `@/types/pokemon` and `@/types/team` — no change needed.

- [ ] **Step 3: Update consumers**

Run: `grep -rln "lib/type-chart\|hooks/useTypeAnalysis\|components/type-analysis" src`

For every hit outside `src/features/type-analysis/`, replace:
- `@/lib/type-chart` → `@/features/type-analysis/lib/type-chart`
- `@/hooks/useTypeAnalysis` → `@/features/type-analysis/hooks/useTypeAnalysis`
- `@/components/type-analysis/TeamAnalysisPanel` → `@/features/type-analysis/components/TeamAnalysisPanel`

Known consumers from the current codebase: `src/components/team/TeamLabAnalysis.tsx` (`lib/type-chart`), `src/app/appDataAdapters.ts` (`lib/type-chart`).

`src/components/team/TeamLabAnalysis.tsx`:
```diff
-} from '@/lib/type-chart'
+} from '@/features/type-analysis/lib/type-chart'
```

`src/app/appDataAdapters.ts`:
```diff
-} from '@/lib/type-chart'
+} from '@/features/type-analysis/lib/type-chart'
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move type-analysis into feature folder, drop dead type-calculator stub"
```

---

### Task 4: Move `search` into a feature folder

**Files:**
- Move: `src/features/pokemon-search/SearchExperience.tsx` → `src/features/search/components/SearchExperience.tsx`
- Move: `src/lib/search/index.ts` → `src/features/search/lib/search.ts`
- Move: `src/lib/search/index.test.ts` → `src/features/search/lib/search.test.ts`
- Move: `src/stores/searchHistoryStore.ts` → `src/features/search/store/searchHistoryStore.ts`
- Delete: `src/features/pokemon-search/index.ts` (dead stub), `src/features/pokemon-detail/index.ts` and its directory (confirmed unreferenced anywhere in `src`)
- Modify: `src/services/pokeapi/endpoints.ts`, `src/app/App.tsx`

**Interfaces:**
- Consumes: `@/types/pokemon` (unchanged).
- Produces: `@/features/search/components/SearchExperience`, `@/features/search/lib/search` (exports `getPokemonSearchCandidates`, `getPokemonAutocompleteSuggestions`, etc.), `@/features/search/store/searchHistoryStore`.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/features/search/components src/features/search/lib src/features/search/store
git mv src/features/pokemon-search/SearchExperience.tsx src/features/search/components/SearchExperience.tsx
git mv src/lib/search/index.ts src/features/search/lib/search.ts
git mv src/lib/search/index.test.ts src/features/search/lib/search.test.ts
git mv src/stores/searchHistoryStore.ts src/features/search/store/searchHistoryStore.ts
git rm src/features/pokemon-search/index.ts
git rm -r src/features/pokemon-detail
```

- [ ] **Step 2: Fix the moved files' own imports**

`src/features/search/components/SearchExperience.tsx`:
```diff
-} from '@/lib/search'
+} from '@/features/search/lib/search'
```

`src/features/search/lib/search.ts` and `search.test.ts`: only import `@/types/pokemon` — no change.

`src/features/search/store/searchHistoryStore.ts`: only imports `@/lib/storage` — no change (moves in Task 7).

- [ ] **Step 3: Update consumers**

`src/services/pokeapi/endpoints.ts`:
```diff
-import { getPokemonSearchCandidates } from '@/lib/search'
+import { getPokemonSearchCandidates } from '@/features/search/lib/search'
```

`src/app/App.tsx`:
```diff
-import { SearchExperience } from '@/features/pokemon-search/SearchExperience'
+import { SearchExperience } from '@/features/search/components/SearchExperience'
```
```diff
-import { getPokemonAutocompleteSuggestions } from '@/lib/search'
+import { getPokemonAutocompleteSuggestions } from '@/features/search/lib/search'
```
```diff
-import { useSearchHistoryStore } from '@/stores/searchHistoryStore'
+import { useSearchHistoryStore } from '@/features/search/store/searchHistoryStore'
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move search into feature folder, drop dead pokemon-detail stub"
```

---

### Task 5: Move `team` into a feature folder

**Files:**
- Move: `src/components/team/AddToTeamDialog.tsx` → `src/features/team/components/AddToTeamDialog.tsx`
- Move: `src/components/team/TeamLabAnalysis.tsx` → `src/features/team/components/TeamLabAnalysis.tsx`
- Move: `src/components/team/TeamPokemonEditor.tsx` → `src/features/team/components/TeamPokemonEditor.tsx`
- Move: `src/components/team/TeamSlotCard.tsx` → `src/features/team/components/TeamSlotCard.tsx`
- Move: `src/features/team-builder/TeamLabView.tsx` → `src/features/team/components/TeamLabView.tsx`
- Move: `src/stores/teamStore.ts` → `src/features/team/store/teamStore.ts`
- Delete: `src/components/team/index.ts`, `src/features/team-builder/` directory (its `index.ts` re-export is superseded by Task 8's `features/team` barrel)
- Modify: `src/app/App.tsx`, `src/app/appDataAdapters.ts`

**Interfaces:**
- Consumes: `@/types/team`, `@/types/pokemon`, `@/hooks/usePokemon`, `@/hooks/usePokemonMoves`, `@/features/type-analysis/lib/type-chart`, `@/lib/stats`, `@/lib/hidden-power`, `@/lib/items` (pokemon hooks move in Task 6, lib/* in Task 7 — update those import paths again in those later tasks, not here).
- Produces: `@/features/team/components/{AddToTeamDialog,TeamLabAnalysis,TeamPokemonEditor,TeamSlotCard,TeamLabView}`, `@/features/team/store/teamStore`.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/features/team/components src/features/team/store
git mv src/components/team/AddToTeamDialog.tsx src/features/team/components/AddToTeamDialog.tsx
git mv src/components/team/TeamLabAnalysis.tsx src/features/team/components/TeamLabAnalysis.tsx
git mv src/components/team/TeamPokemonEditor.tsx src/features/team/components/TeamPokemonEditor.tsx
git mv src/components/team/TeamSlotCard.tsx src/features/team/components/TeamSlotCard.tsx
git mv src/features/team-builder/TeamLabView.tsx src/features/team/components/TeamLabView.tsx
git mv src/stores/teamStore.ts src/features/team/store/teamStore.ts
git rm src/components/team/index.ts
git rm -r src/features/team-builder
```

- [ ] **Step 2: Fix the moved files' own imports**

`src/features/team/components/TeamLabView.tsx`:
```diff
-import { TeamLabAnalysis } from '@/components/team/TeamLabAnalysis'
-import { TeamPokemonEditor } from '@/components/team/TeamPokemonEditor'
-import { TeamSlotCard } from '@/components/team/TeamSlotCard'
+import { TeamLabAnalysis } from '@/features/team/components/TeamLabAnalysis'
+import { TeamPokemonEditor } from '@/features/team/components/TeamPokemonEditor'
+import { TeamSlotCard } from '@/features/team/components/TeamSlotCard'
```
(leave `@/hooks/usePokemon`, `@/hooks/usePokemonMoves`, `@/types/team` as-is — fixed in Tasks 6/7)

`src/features/team/components/TeamLabAnalysis.tsx`:
```diff
-} from '@/features/type-analysis/lib/type-chart'
```
Already correct from Task 3 — no change needed here (import target didn't move again).

- [ ] **Step 3: Update consumers**

`src/app/App.tsx`:
```diff
-import { AddToTeamDialog } from '@/components/team/AddToTeamDialog'
+import { AddToTeamDialog } from '@/features/team/components/AddToTeamDialog'
```
```diff
-import { TeamLabView } from '@/features/team-builder'
+import { TeamLabView } from '@/features/team/components/TeamLabView'
```
```diff
-import { useTeamStore } from '@/stores/teamStore'
+import { useTeamStore } from '@/features/team/store/teamStore'
```

`src/app/appDataAdapters.ts`: no direct import of moved team components/store today (only `@/types/team`, unaffected) — confirm with:

Run: `grep -n "components/team\|stores/teamStore" src/app/appDataAdapters.ts`
Expected: no output. If there is output, apply the same path fix shown above.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move team into feature folder"
```

---

### Task 6: Move `pokemon` into a feature folder

**Files:**
- Move: `src/components/pokemon/AbilityDetailsDialog.tsx` → `src/features/pokemon/components/AbilityDetailsDialog.tsx`
- Move: `src/components/pokemon/PokemonCard.tsx` → `src/features/pokemon/components/PokemonCard.tsx`
- Move: `src/components/pokemon/PokemonTabs.tsx` → `src/features/pokemon/components/PokemonTabs.tsx`
- Move: `src/components/pokemon/TypeBadges.tsx` → `src/features/pokemon/components/TypeBadges.tsx`
- Move: `src/hooks/useAbility.ts` → `src/features/pokemon/hooks/useAbility.ts`
- Move: `src/hooks/useEvolutionChain.ts` → `src/features/pokemon/hooks/useEvolutionChain.ts`
- Move: `src/hooks/useMovesDetails.ts` → `src/features/pokemon/hooks/useMovesDetails.ts`
- Move: `src/hooks/usePokemon.ts` → `src/features/pokemon/hooks/usePokemon.ts`
- Move: `src/hooks/usePokemonForms.ts` → `src/features/pokemon/hooks/usePokemonForms.ts`
- Move: `src/hooks/usePokemonList.ts` → `src/features/pokemon/hooks/usePokemonList.ts`
- Move: `src/hooks/usePokemonMoves.ts` → `src/features/pokemon/hooks/usePokemonMoves.ts`
- Move: `src/hooks/usePokemonSpecies.ts` → `src/features/pokemon/hooks/usePokemonSpecies.ts`
- Move: `src/hooks/usePokemonSummaries.ts` → `src/features/pokemon/hooks/usePokemonSummaries.ts`
- Delete: `src/components/pokemon/index.ts` (dead stub)
- Modify: `src/features/favorites/components/*.tsx`, `src/features/team/components/*.tsx`, `src/app/App.tsx`, `src/app/appDataAdapters.ts`

**Interfaces:**
- Consumes: `@/services/pokeapi/*`, `@/lib/utils`, `@/types/pokemon` (unchanged here, `services`/`lib`/`types` move in Task 7).
- Produces: `@/features/pokemon/components/{AbilityDetailsDialog,PokemonCard,PokemonTabs,TypeBadges}`, `@/features/pokemon/hooks/{useAbility,useEvolutionChain,useMovesDetails,usePokemon,usePokemonForms,usePokemonList,usePokemonMoves,usePokemonSpecies,usePokemonSummaries}`.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/features/pokemon/components src/features/pokemon/hooks
git mv src/components/pokemon/AbilityDetailsDialog.tsx src/features/pokemon/components/AbilityDetailsDialog.tsx
git mv src/components/pokemon/PokemonCard.tsx src/features/pokemon/components/PokemonCard.tsx
git mv src/components/pokemon/PokemonTabs.tsx src/features/pokemon/components/PokemonTabs.tsx
git mv src/components/pokemon/TypeBadges.tsx src/features/pokemon/components/TypeBadges.tsx
git mv src/hooks/useAbility.ts src/features/pokemon/hooks/useAbility.ts
git mv src/hooks/useEvolutionChain.ts src/features/pokemon/hooks/useEvolutionChain.ts
git mv src/hooks/useMovesDetails.ts src/features/pokemon/hooks/useMovesDetails.ts
git mv src/hooks/usePokemon.ts src/features/pokemon/hooks/usePokemon.ts
git mv src/hooks/usePokemonForms.ts src/features/pokemon/hooks/usePokemonForms.ts
git mv src/hooks/usePokemonList.ts src/features/pokemon/hooks/usePokemonList.ts
git mv src/hooks/usePokemonMoves.ts src/features/pokemon/hooks/usePokemonMoves.ts
git mv src/hooks/usePokemonSpecies.ts src/features/pokemon/hooks/usePokemonSpecies.ts
git mv src/hooks/usePokemonSummaries.ts src/features/pokemon/hooks/usePokemonSummaries.ts
git rm src/components/pokemon/index.ts
rmdir src/hooks 2>/dev/null || true
```

(the last `rmdir` is best-effort — if any hook remains because a later step in this task hasn't run yet, it fails silently and that's fine)

- [ ] **Step 2: Fix the moved files' own imports**

None of the moved hooks/components import each other's old `@/components/pokemon/*` or `@/hooks/*` paths except one: `PokemonTabs.tsx` is consumed by `appDataAdapters.ts` (fixed in Step 3), and none of the hooks import components. No internal fixes needed within this group.

- [ ] **Step 3: Update consumers**

`src/features/favorites/components/RecentPokemonPanel.tsx`, `FavoritesPanel.tsx`, `FavoritesDrawer.tsx` (all three, same change):
```diff
-import { TypeBadges } from '@/components/pokemon/TypeBadges'
+import { TypeBadges } from '@/features/pokemon/components/TypeBadges'
```

`src/features/team/components/TeamLabView.tsx`:
```diff
-import { usePokemon } from '@/hooks/usePokemon'
-import { useMoveDetails } from '@/hooks/usePokemonMoves'
+import { usePokemon } from '@/features/pokemon/hooks/usePokemon'
+import { useMoveDetails } from '@/features/pokemon/hooks/usePokemonMoves'
```

`src/app/appDataAdapters.ts`:
```diff
-import type { PokemonTabData } from '@/components/pokemon/PokemonTabs'
+import type { PokemonTabData } from '@/features/pokemon/components/PokemonTabs'
```

`src/app/App.tsx`:
```diff
-import { AbilityDetailsDialog } from '@/components/pokemon/AbilityDetailsDialog'
-import { PokemonCard } from '@/components/pokemon/PokemonCard'
-import { PokemonTabs, type PokemonTabName } from '@/components/pokemon/PokemonTabs'
+import { AbilityDetailsDialog } from '@/features/pokemon/components/AbilityDetailsDialog'
+import { PokemonCard } from '@/features/pokemon/components/PokemonCard'
+import { PokemonTabs, type PokemonTabName } from '@/features/pokemon/components/PokemonTabs'
```
```diff
-import { usePokemon } from '@/hooks/usePokemon'
-import { useAbility } from '@/hooks/useAbility'
-import { useEvolutionChain } from '@/hooks/useEvolutionChain'
-import { usePokemonAutocompleteList } from '@/hooks/usePokemonList'
-import { useMovesDetails } from '@/hooks/useMovesDetails'
-import { usePokemonSpecies } from '@/hooks/usePokemonSpecies'
-import { usePokemonSummaries } from '@/hooks/usePokemonSummaries'
+import { usePokemon } from '@/features/pokemon/hooks/usePokemon'
+import { useAbility } from '@/features/pokemon/hooks/useAbility'
+import { useEvolutionChain } from '@/features/pokemon/hooks/useEvolutionChain'
+import { usePokemonAutocompleteList } from '@/features/pokemon/hooks/usePokemonList'
+import { useMovesDetails } from '@/features/pokemon/hooks/useMovesDetails'
+import { usePokemonSpecies } from '@/features/pokemon/hooks/usePokemonSpecies'
+import { usePokemonSummaries } from '@/features/pokemon/hooks/usePokemonSummaries'
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green. Confirm no leftover empty `src/hooks` or `src/components/pokemon`:

Run: `ls src/hooks src/components 2>/dev/null`
Expected: `src/hooks` no longer exists; `src/components` contains only `layout/` and `ui/` (moved in Task 7).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move pokemon into feature folder"
```

---

### Task 7: Move remaining cross-cutting code into `shared/`

**Files:**
- Move: `src/components/ui/StatusStates.tsx` → `src/shared/ui/StatusStates.tsx`
- Move: `src/components/ui/index.ts` → `src/shared/ui/index.ts`
- Move: `src/components/layout/index.ts` → `src/shared/ui/layout.ts`
- Move: `src/lib/hidden-power/index.ts` → `src/shared/lib/hidden-power.ts`
- Move: `src/lib/hidden-power/index.test.ts` → `src/shared/lib/hidden-power.test.ts`
- Move: `src/lib/items/index.ts` → `src/shared/lib/items.ts`
- Move: `src/lib/items/index.test.ts` → `src/shared/lib/items.test.ts`
- Move: `src/lib/stats/index.ts` → `src/shared/lib/stats.ts`
- Move: `src/lib/stats/index.test.ts` → `src/shared/lib/stats.test.ts`
- Move: `src/lib/storage/index.ts` → `src/shared/lib/storage.ts`
- Move: `src/lib/utils/index.ts` → `src/shared/lib/utils.ts`
- Move: `src/lib/utils/index.test.ts` → `src/shared/lib/utils.test.ts`
- Move: `src/services/pokeapi/client.ts` → `src/shared/services/pokeapi/client.ts`
- Move: `src/services/pokeapi/endpoints.ts` → `src/shared/services/pokeapi/endpoints.ts`
- Move: `src/services/pokeapi/endpoints.test.ts` → `src/shared/services/pokeapi/endpoints.test.ts`
- Move: `src/services/pokeapi/mappers.ts` → `src/shared/services/pokeapi/mappers.ts`
- Move: `src/services/pokeapi/mappers.test.ts` → `src/shared/services/pokeapi/mappers.test.ts`
- Move: `src/stores/settingsStore.ts` → `src/shared/stores/settingsStore.ts`
- Move: `src/types/pokeapi.ts` → `src/shared/types/pokeapi.ts`
- Move: `src/types/pokemon.ts` → `src/shared/types/pokemon.ts`
- Move: `src/types/team.ts` → `src/shared/types/team.ts`
- Modify: every remaining file across `src/` importing `@/lib/*`, `@/services/pokeapi/*`, `@/stores/settingsStore`, `@/types/*`

**Interfaces:**
- Produces: `@/shared/lib/{hidden-power,items,stats,storage,utils}`, `@/shared/services/pokeapi/{client,endpoints,mappers}`, `@/shared/stores/settingsStore`, `@/shared/types/{pokeapi,pokemon,team}`, `@/shared/ui/{StatusStates,layout,index}`. These are the final import paths — no further moves happen after this task.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/shared/ui src/shared/lib src/shared/services/pokeapi src/shared/stores src/shared/types

git mv src/components/ui/StatusStates.tsx src/shared/ui/StatusStates.tsx
git mv src/components/ui/index.ts src/shared/ui/index.ts
git mv src/components/layout/index.ts src/shared/ui/layout.ts

git mv src/lib/hidden-power/index.ts src/shared/lib/hidden-power.ts
git mv src/lib/hidden-power/index.test.ts src/shared/lib/hidden-power.test.ts
git mv src/lib/items/index.ts src/shared/lib/items.ts
git mv src/lib/items/index.test.ts src/shared/lib/items.test.ts
git mv src/lib/stats/index.ts src/shared/lib/stats.ts
git mv src/lib/stats/index.test.ts src/shared/lib/stats.test.ts
git mv src/lib/storage/index.ts src/shared/lib/storage.ts
git mv src/lib/utils/index.ts src/shared/lib/utils.ts
git mv src/lib/utils/index.test.ts src/shared/lib/utils.test.ts

git mv src/services/pokeapi/client.ts src/shared/services/pokeapi/client.ts
git mv src/services/pokeapi/endpoints.ts src/shared/services/pokeapi/endpoints.ts
git mv src/services/pokeapi/endpoints.test.ts src/shared/services/pokeapi/endpoints.test.ts
git mv src/services/pokeapi/mappers.ts src/shared/services/pokeapi/mappers.ts
git mv src/services/pokeapi/mappers.test.ts src/shared/services/pokeapi/mappers.test.ts

git mv src/stores/settingsStore.ts src/shared/stores/settingsStore.ts

git mv src/types/pokeapi.ts src/shared/types/pokeapi.ts
git mv src/types/pokemon.ts src/shared/types/pokemon.ts
git mv src/types/team.ts src/shared/types/team.ts

rmdir src/components/ui src/components/layout src/components 2>/dev/null || true
rmdir src/lib/hidden-power src/lib/items src/lib/stats src/lib/storage src/lib/utils src/lib 2>/dev/null || true
rmdir src/services/pokeapi src/services 2>/dev/null || true
rmdir src/stores src/types 2>/dev/null || true
```

- [ ] **Step 2: Fix the moved files' own cross-references**

`src/shared/services/pokeapi/mappers.ts`:
```diff
-} from '@/types/pokemon'
+} from '@/shared/types/pokemon'
...
-} from '@/types/pokeapi'
-import type { TeamPokemon } from '@/types/team'
-import { formatGenerationName, formatPokemonName } from '@/lib/utils'
+} from '@/shared/types/pokeapi'
+import type { TeamPokemon } from '@/shared/types/team'
+import { formatGenerationName, formatPokemonName } from '@/shared/lib/utils'
```

`src/shared/services/pokeapi/mappers.test.ts`:
```diff
-} from '@/types/pokeapi'
+} from '@/shared/types/pokeapi'
```

`src/shared/services/pokeapi/endpoints.ts`:
```diff
-} from '@/types/pokeapi'
-import { getPokemonSearchCandidates } from '@/features/search/lib/search'
+} from '@/shared/types/pokeapi'
+import { getPokemonSearchCandidates } from '@/features/search/lib/search'
```
(the `search` import is already correct from Task 4 — only the `types/pokeapi` line changes)

`src/shared/services/pokeapi/endpoints.test.ts`:
```diff
-import type { PokeApiPokemonFormResponse, PokeApiPokemonResponse } from '@/types/pokeapi'
+import type { PokeApiPokemonFormResponse, PokeApiPokemonResponse } from '@/shared/types/pokeapi'
```

`src/shared/stores/settingsStore.ts`:
```diff
-import { createLocalForageStateStorage } from '@/lib/storage'
+import { createLocalForageStateStorage } from '@/shared/lib/storage'
```

`src/shared/lib/hidden-power.ts`:
```diff
-import type { PokemonStatName, PokemonTypeName } from '@/types/pokemon'
-import type { CompetitiveStatTable } from '@/types/team'
+import type { PokemonStatName, PokemonTypeName } from '@/shared/types/pokemon'
+import type { CompetitiveStatTable } from '@/shared/types/team'
```

`src/shared/lib/hidden-power.test.ts`: check its import line with `grep -n "types/pokemon\|types/team" src/shared/lib/hidden-power.test.ts` and apply the same `@/types/*` → `@/shared/types/*` fix if present.

`src/shared/lib/items.ts`:
```diff
-import type { HeldItemOption } from '@/types/pokemon'
+import type { HeldItemOption } from '@/shared/types/pokemon'
```

`src/shared/lib/stats.ts`:
```diff
-import type { PokemonStatName, PokemonStats } from '@/types/pokemon'
+import type { PokemonStatName, PokemonStats } from '@/shared/types/pokemon'
...
-} from '@/types/team'
+} from '@/shared/types/team'
```

`src/shared/lib/stats.test.ts`:
```diff
-import type { PokemonStats } from '@/types/pokemon'
-import type { TeamPokemon } from '@/types/team'
+import type { PokemonStats } from '@/shared/types/pokemon'
+import type { TeamPokemon } from '@/shared/types/team'
```

`src/shared/lib/utils.ts` and `utils.test.ts`: no cross-folder imports (pure functions) — no change.

`src/shared/lib/storage.ts`: no cross-folder imports — no change.

- [ ] **Step 3: Update every remaining consumer across the app**

Run this to find every remaining reference to the old paths:

```bash
grep -rln "@/lib/\|@/services/pokeapi\|@/stores/settingsStore\|@/types/" src
```

Apply these path substitutions wherever found (exact old → new):
- `@/lib/hidden-power` → `@/shared/lib/hidden-power`
- `@/lib/items` → `@/shared/lib/items`
- `@/lib/stats` → `@/shared/lib/stats`
- `@/lib/storage` → `@/shared/lib/storage`
- `@/lib/utils` → `@/shared/lib/utils`
- `@/services/pokeapi/client` → `@/shared/services/pokeapi/client`
- `@/services/pokeapi/endpoints` → `@/shared/services/pokeapi/endpoints`
- `@/services/pokeapi/mappers` → `@/shared/services/pokeapi/mappers`
- `@/stores/settingsStore` → `@/shared/stores/settingsStore`
- `@/types/pokeapi` → `@/shared/types/pokeapi`
- `@/types/pokemon` → `@/shared/types/pokemon`
- `@/types/team` → `@/shared/types/team`

Known files needing this (from the current codebase, confirm against the grep output above and fix any the grep finds that aren't listed): `src/features/pokemon/hooks/*.ts` (all 9), `src/features/team/components/*.tsx` (all 5), `src/features/team/store/teamStore.ts`, `src/features/favorites/components/*.tsx` (all 3), `src/features/favorites/store/favoritesStore.ts`, `src/features/search/components/SearchExperience.tsx`, `src/features/search/store/searchHistoryStore.ts`, `src/features/type-analysis/components/TeamAnalysisPanel.tsx`, `src/features/type-analysis/lib/type-chart.ts`, `src/features/type-analysis/lib/type-chart.test.ts`, `src/app/App.tsx`, `src/app/appDataAdapters.ts`.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green. Confirm the old top-level folders are gone:

Run: `ls src`
Expected: only `app/`, `features/`, `shared/`, `assets/`, `App.css`, `index.css`, `main.tsx` remain (no `components/`, `hooks/`, `lib/`, `services/`, `stores/`, `types/` at the root).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move shared code (lib, services, types, ui, settingsStore) into shared/"
```

---

### Task 8: Populate feature barrels and import from them in `App.tsx`

**Files:**
- Modify: `src/features/pokemon/index.ts`, `src/features/search/index.ts`, `src/features/team/index.ts`, `src/features/favorites/index.ts`, `src/features/type-analysis/index.ts` (currently `export {}` stubs, except `team`'s which no longer exists after Task 5's `team-builder` removal — create `src/features/team/index.ts` fresh)
- Modify: `src/app/App.tsx` (import from barrels instead of deep paths)
- Modify: `src/app/appDataAdapters.ts` (import from barrels where applicable)

**Interfaces:**
- Produces: `@/features/pokemon`, `@/features/search`, `@/features/team`, `@/features/favorites`, `@/features/type-analysis` as the only import paths anything outside a feature needs.

- [ ] **Step 1: Write each feature's barrel**

`src/features/favorites/index.ts`:
```ts
export { FavoritesDrawer } from './components/FavoritesDrawer'
export { FavoritesPanel } from './components/FavoritesPanel'
export { RecentPokemonPanel } from './components/RecentPokemonPanel'
export { useFavoritesStore } from './store/favoritesStore'
```

`src/features/type-analysis/index.ts`:
```ts
export { TeamAnalysisPanel } from './components/TeamAnalysisPanel'
export { useTypeAnalysis } from './hooks/useTypeAnalysis'
export { calculateTypeAnalysis } from './lib/type-chart'
export type { OffensiveCoverage, TeamDefensiveTypeSummary } from './lib/type-chart'
```

`src/features/search/index.ts`:
```ts
export { SearchExperience } from './components/SearchExperience'
export { getPokemonAutocompleteSuggestions, getPokemonSearchCandidates } from './lib/search'
export { useSearchHistoryStore } from './store/searchHistoryStore'
```

`src/features/team/index.ts` (new file, replaces the removed `team-builder/index.ts`):
```ts
export { TeamLabView } from './components/TeamLabView'
export { AddToTeamDialog } from './components/AddToTeamDialog'
export { useTeamStore } from './store/teamStore'
```

`src/features/pokemon/index.ts`:
```ts
export { AbilityDetailsDialog } from './components/AbilityDetailsDialog'
export { PokemonCard } from './components/PokemonCard'
export { PokemonTabs, type PokemonTabName } from './components/PokemonTabs'
export { TypeBadges } from './components/TypeBadges'
export { usePokemon } from './hooks/usePokemon'
export { useAbility } from './hooks/useAbility'
export { useEvolutionChain } from './hooks/useEvolutionChain'
export { usePokemonAutocompleteList } from './hooks/usePokemonList'
export { useMovesDetails } from './hooks/useMovesDetails'
export { usePokemonSpecies } from './hooks/usePokemonSpecies'
export { usePokemonSummaries } from './hooks/usePokemonSummaries'
export { useMoveDetails } from './hooks/usePokemonMoves'
```

Before writing each barrel, confirm the exact exported names still match by running:

Run: `grep -n "^export" src/features/pokemon/hooks/*.ts src/features/pokemon/components/*.tsx`

and adjust the barrel above if any name differs from what's listed (the plan lists best-known names from the current source; the grep is the source of truth at execution time).

- [ ] **Step 2: Update `src/app/App.tsx` to import from barrels**

```diff
-import { AbilityDetailsDialog } from '@/features/pokemon/components/AbilityDetailsDialog'
-import { PokemonCard } from '@/features/pokemon/components/PokemonCard'
-import { PokemonTabs, type PokemonTabName } from '@/features/pokemon/components/PokemonTabs'
-import { AddToTeamDialog } from '@/features/team/components/AddToTeamDialog'
-import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
-import { FavoritesDrawer } from '@/features/favorites/components/FavoritesDrawer'
-import { RecentPokemonPanel } from '@/features/favorites/components/RecentPokemonPanel'
-import { SearchExperience } from '@/features/search/components/SearchExperience'
-import { TeamLabView } from '@/features/team/components/TeamLabView'
-import { normalizePokemonSearch } from '@/shared/lib/utils'
-import { getPokemonAutocompleteSuggestions } from '@/features/search/lib/search'
-import { usePokemon } from '@/features/pokemon/hooks/usePokemon'
-import { useAbility } from '@/features/pokemon/hooks/useAbility'
-import { useEvolutionChain } from '@/features/pokemon/hooks/useEvolutionChain'
-import { usePokemonAutocompleteList } from '@/features/pokemon/hooks/usePokemonList'
-import { useMovesDetails } from '@/features/pokemon/hooks/useMovesDetails'
-import { usePokemonSpecies } from '@/features/pokemon/hooks/usePokemonSpecies'
-import { usePokemonSummaries } from '@/features/pokemon/hooks/usePokemonSummaries'
-import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
-import { useSearchHistoryStore } from '@/features/search/store/searchHistoryStore'
-import { useTeamStore } from '@/features/team/store/teamStore'
-import type { PokemonSummary } from '@/shared/types/pokemon'
+import {
+  AbilityDetailsDialog,
+  PokemonCard,
+  PokemonTabs,
+  type PokemonTabName,
+  usePokemon,
+  useAbility,
+  useEvolutionChain,
+  usePokemonAutocompleteList,
+  useMovesDetails,
+  usePokemonSpecies,
+  usePokemonSummaries,
+} from '@/features/pokemon'
+import { AddToTeamDialog, TeamLabView, useTeamStore } from '@/features/team'
+import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
+import { FavoritesDrawer, RecentPokemonPanel, useFavoritesStore } from '@/features/favorites'
+import {
+  SearchExperience,
+  getPokemonAutocompleteSuggestions,
+  useSearchHistoryStore,
+} from '@/features/search'
+import { normalizePokemonSearch } from '@/shared/lib/utils'
+import type { PokemonSummary } from '@/shared/types/pokemon'
```

- [ ] **Step 3: Update `src/app/appDataAdapters.ts` to import from barrels where it imports feature internals**

```diff
-} from '@/features/type-analysis/lib/type-chart'
+} from '@/features/type-analysis'
...
-import type { PokemonTabData } from '@/features/pokemon/components/PokemonTabs'
+import type { PokemonTabData } from '@/features/pokemon'
```

(leave `@/shared/types/pokemon`, `@/shared/types/team`, `@/shared/lib/stats` as-is — those are genuinely shared, not feature-owned)

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: populate feature barrels, import features via public API in App.tsx"
```

---

## Final Verification

- [ ] Run `npm run dev`, open the app, and manually confirm: search works, selecting a Pokémon loads its card/tabs, adding a Pokémon to a team works, favorites toggle and show in the drawer, recent Pokémon panel shows history, team lab analysis renders. This is a UI smoke test since no automated component tests exist yet (added in Fase 1, Task 5 of the stack-improvements plan).
- [ ] Run `npm run build && npm run lint && npm run test` one final time — all green.
- [ ] Confirm `git log --oneline -8` shows the 7 refactor commits in order.
