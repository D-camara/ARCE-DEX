# Fase 1 Stack Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (executed inline by the controller, no subagents). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Archivum Arceus stack after Fase 0's folder restructure: strict TypeScript, a real PWA, a full Tailwind CSS migration, a slimmer `App.tsx`, store test coverage, Docker packaging, CI, and small resilience/DX libraries — with zero product-behavior change.

**Architecture:** Each task is independently buildable and verified with `npm run build && npm run lint && npm run test` before commit. Order matters: TypeScript strict mode runs first (catches latent bugs before the big Tailwind rewrite touches every file), then the small `App.tsx` hook extraction (fewer moving parts before the CSS rewrite), then the Tailwind migration (the largest task, done feature-folder by feature-folder mirroring Fase 0's structure), then the independent items (PWA, tests, Docker, CI, resilience libs) in any order.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), vite-plugin-pwa, Vitest + Testing Library, Docker (nginx), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-18-stack-improvements-design.md` (Fase 1 section, items 1-8)

## Global Constraints

- No behavior change beyond visual re-implementation with Tailwind: search, favorites, team builder, and history must work identically after every task.
- No Tailwind/CSS-in-JS mixing — pure CSS is fully replaced by Tailwind utility classes (per spec's explicit authorization to change the styling rule).
- Every task ends green on `npm run build`, `npm run lint`, `npm run test`.
- Work happens inside `arce-dex/` (the Vite project root) unless a step says otherwise (Docker/CI files live at the repo or `arce-dex/` root as specified per task).
- No new dependencies beyond what each task names explicitly.

---

### Task 1: TypeScript strict mode

**Files:**
- Modify: `tsconfig.app.json`

**Interfaces:**
- Produces: strict type-checking for every subsequent task in this plan.

- [ ] **Step 1: Enable strict mode**

Edit `tsconfig.app.json`, add `"strict": true` inside `compilerOptions` (alongside the existing `noUnusedLocals`, `noUnusedParameters` etc.):

```json
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "strict": true,
```

- [ ] **Step 2: Build and fix whatever strict mode surfaces**

Run: `npm run build`

If it fails, fix each reported error at its source (add explicit types, narrow `null`/`undefined` checks, etc.) — do not silence errors with `as any` or `// @ts-expect-error`. If a fix is non-obvious, read the surrounding function fully before changing it; these are pre-existing latent gaps, not new behavior to invent.

- [ ] **Step 3: Verify lint and tests still pass**

Run: `npm run lint && npm run test`
Expected: both green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: enable TypeScript strict mode"
```

---

### Task 2: Extract view and dialog state out of App.tsx

**Files:**
- Create: `src/app/useAppView.ts`
- Create: `src/app/useAppDialogs.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `useAppView()` returning `{ activeView, setActiveView, activePokemonTab, setActivePokemonTab, query, setQuery, isAutocompleteOpen, setIsAutocompleteOpen, selectedIdentifier, setSelectedIdentifier, selectedAbilityName, setSelectedAbilityName }`.
- Produces: `useAppDialogs()` returning `{ isFavoritesOpen, setIsFavoritesOpen, isAddToTeamOpen, setIsAddToTeamOpen, selectedAddTeamId, setSelectedAddTeamId, showToast, toastMessage, showToastMessage }` where `showToastMessage(message: string)` sets the message, shows the toast, and auto-hides it after 2400ms (replacing the repeated `setToastMessage` + `setShowToast(true)` + `window.setTimeout` blocks currently duplicated three times in `App.tsx`).

- [ ] **Step 1: Create `useAppView`**

```ts
import { useState } from 'react'
import type { PokemonTabName } from '@/features/pokemon'

export function useAppView() {
  const [activeView, setActiveView] = useState<'dex' | 'team-lab'>('dex')
  const [activePokemonTab, setActivePokemonTab] = useState<PokemonTabName>('Info')
  const [query, setQuery] = useState('')
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | number>(448)
  const [selectedAbilityName, setSelectedAbilityName] = useState<string | null>(null)

  return {
    activeView,
    setActiveView,
    activePokemonTab,
    setActivePokemonTab,
    query,
    setQuery,
    isAutocompleteOpen,
    setIsAutocompleteOpen,
    selectedIdentifier,
    setSelectedIdentifier,
    selectedAbilityName,
    setSelectedAbilityName,
  }
}
```

- [ ] **Step 2: Create `useAppDialogs`**

```ts
import { useState } from 'react'

const TOAST_DURATION_MS = 2400

export function useAppDialogs() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isAddToTeamOpen, setIsAddToTeamOpen] = useState(false)
  const [selectedAddTeamId, setSelectedAddTeamId] = useState('team-1')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  function showToastMessage(message: string) {
    setToastMessage(message)
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), TOAST_DURATION_MS)
  }

  return {
    isFavoritesOpen,
    setIsFavoritesOpen,
    isAddToTeamOpen,
    setIsAddToTeamOpen,
    selectedAddTeamId,
    setSelectedAddTeamId,
    showToast,
    toastMessage,
    showToastMessage,
  }
}
```

- [ ] **Step 3: Rewire `App.tsx` to use both hooks**

Replace the block of `useState` calls (current lines 37-47) with:

```ts
  const view = useAppView()
  const dialogs = useAppDialogs()
```

Add the imports:

```ts
import { useAppView } from './useAppView'
import { useAppDialogs } from './useAppDialogs'
```

Then replace every reference throughout the component body and JSX:
- `query` → `view.query`, `setQuery` → `view.setQuery`
- `activeView` → `view.activeView`, `setActiveView` → `view.setActiveView`
- `selectedIdentifier` → `view.selectedIdentifier`, `setSelectedIdentifier` → `view.setSelectedIdentifier`
- `isAutocompleteOpen` → `view.isAutocompleteOpen`, `setIsAutocompleteOpen` → `view.setIsAutocompleteOpen`
- `activePokemonTab` → `view.activePokemonTab`, `setActivePokemonTab` → `view.setActivePokemonTab`
- `selectedAbilityName` → `view.selectedAbilityName`, `setSelectedAbilityName` → `view.setSelectedAbilityName`
- `isFavoritesOpen` → `dialogs.isFavoritesOpen`, `setIsFavoritesOpen` → `dialogs.setIsFavoritesOpen`
- `isAddToTeamOpen` → `dialogs.isAddToTeamOpen`, `setIsAddToTeamOpen` → `dialogs.setIsAddToTeamOpen`
- `selectedAddTeamId` → `dialogs.selectedAddTeamId`, `setSelectedAddTeamId` → `dialogs.setSelectedAddTeamId`
- `showToast` → `dialogs.showToast`, `toastMessage` → `dialogs.toastMessage`

Collapse the three repeated toast blocks. `handleConfirmAddToTeam`'s toast block:

```diff
-    setToastMessage(
-      wasAdded
-        ? `${selectedPokemon.displayName} adicionado em ${team?.name ?? 'time'}.`
-        : `${team?.name ?? 'Time'} esta cheio.`,
-    )
-    setShowToast(true)
-    setIsAddToTeamOpen(!wasAdded)
-
-    window.setTimeout(() => setShowToast(false), 2400)
+    dialogs.showToastMessage(
+      wasAdded
+        ? `${selectedPokemon.displayName} adicionado em ${team?.name ?? 'time'}.`
+        : `${team?.name ?? 'Time'} esta cheio.`,
+    )
+    dialogs.setIsAddToTeamOpen(!wasAdded)
```

`handleToggleFavorite`'s toast block:

```diff
-    setToastMessage(willFavorite ? 'Pokemon favoritado.' : 'Pokemon removido dos favoritos.')
-    setShowToast(true)
-    window.setTimeout(() => setShowToast(false), 2400)
+    dialogs.showToastMessage(willFavorite ? 'Pokemon favoritado.' : 'Pokemon removido dos favoritos.')
```

`handleRemoveFavorite`'s toast block:

```diff
-    setToastMessage('Pokemon removido dos favoritos.')
-    setShowToast(true)
-    window.setTimeout(() => setShowToast(false), 2400)
+    dialogs.showToastMessage('Pokemon removido dos favoritos.')
```

`handlePlayCry`'s error toast block:

```diff
-      setToastMessage('Nao foi possivel tocar o cry agora.')
-      setShowToast(true)
-      window.setTimeout(() => setShowToast(false), 2400)
+      dialogs.showToastMessage('Nao foi possivel tocar o cry agora.')
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green. Run `npm run dev` and manually confirm: search still opens autocomplete, selecting a Pokémon still switches tabs, add-to-team dialog opens/closes, favorites drawer opens/closes, toast appears and auto-hides on favorite/add-to-team/cry actions.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: extract view and dialog state from App.tsx into hooks"
```

---

### Task 3: Install and configure Tailwind CSS

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `vite.config.ts`
- Modify: `src/index.css`
- Delete: `src/App.css` (folded into `index.css`'s `@theme` / base layer)

**Interfaces:**
- Produces: Tailwind utility classes available in every `.tsx` file, and the following custom theme tokens usable as Tailwind classes for the rest of this plan's migration tasks:
  - Colors: `bg-cosmic`, `bg-cosmic-soft`, `bg-surface`, `bg-surface-2`, `bg-surface-3`, `text-ivory`, `text-ivory-soft`, `text-muted`, `border-line`, `border-line-gold`
  - Accent colors: `text-gold` / `bg-gold` (accent-gold), `text-cosmic-blue` / `bg-cosmic-blue`, `text-astral-purple` / `bg-astral-purple`
  - Border radius: `rounded-card` (16px), `rounded-control` (12px)
  - Box shadow: `shadow-glow-gold`, `shadow-glow-blue`, `shadow-glow-purple`

- [ ] **Step 1: Read the current design tokens**

Run: `sed -n '1,60p' src/index.css` and note every `--` custom property under `:root` (colors, glows, radii). These are the values Step 3 below encodes into Tailwind's theme — carry over their exact color/shadow values, don't invent new ones.

- [ ] **Step 2: Install Tailwind**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Wire the Vite plugin**

```diff
 import { defineConfig } from 'vite'
 import react from '@vitejs/plugin-react'
 import path from 'node:path'
+import tailwindcss from '@tailwindcss/vite'

 export default defineConfig({
-  plugins: [react()],
+  plugins: [react(), tailwindcss()],
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   },
 })
```

- [ ] **Step 4: Replace `src/index.css` with the Tailwind entrypoint + theme**

Replace the entire file content with:

```css
@import "tailwindcss";

@theme {
  --color-cosmic: #070707;
  --color-cosmic-soft: #0d0d10;

  --color-surface: rgba(18, 17, 15, 0.82);
  --color-surface-2: rgba(27, 25, 22, 0.86);
  --color-surface-3: rgba(38, 35, 30, 0.9);

  --color-ivory: #f7f1df;
  --color-ivory-soft: #d8cfb8;
  --color-muted: #a79f90;

  --color-line: rgba(255, 246, 216, 0.12);
  --color-line-gold: rgba(201, 166, 70, 0.28);

  --radius-card: 16px;
  --radius-control: 12px;
}

body {
  background-color: var(--color-cosmic);
  color: var(--color-ivory);
  font-family: 'Inter', system-ui, sans-serif;
}
```

Use the actual accent-gold / cosmic-blue / astral-purple hex/rgba values you read in Step 1 in place of any placeholder above where they differ — Step 1's `:root` block is the source of truth for exact values; copy them verbatim rather than approximating.

- [ ] **Step 5: Fold `App.css` into the new system and delete it**

Run: `sed -n '1,184p' src/App.css` and `grep -rn "App.css" src` to find what imports it (expected: `src/main.tsx` or `src/app/App.tsx`). For each rule in `App.css`, either:
- it's a duplicate of something now in `index.css`'s `@theme`/`body` block → delete the rule, or
- it's component-specific → leave translating it for the task in this plan that migrates that specific component (Tasks 4-9 below), and for now move the rule as-is into `index.css` under a `/* TODO(tailwind): migrate */`-free plain CSS block (still valid — Tailwind v4's `@import "tailwindcss"` doesn't forbid hand-written CSS alongside it) so nothing visually breaks before its turn comes.

Remove the `import './App.css'` line from wherever it's imported once its rules have been relocated, then delete `src/App.css`.

- [ ] **Step 6: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green (the app will look unchanged — Tailwind is installed but no component has adopted its utility classes yet).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: install and configure Tailwind CSS v4"
```

---

### Task 4: Migrate `shared/ui` and the `App.tsx` shell to Tailwind

**Files:**
- Modify: `src/shared/ui/StatusStates.tsx`
- Modify: `src/shared/ui/layout.ts` (if it renders JSX; if it's a pure re-export barrel, skip)
- Modify: `src/app/App.tsx` (the `app-shell`, `topbar`, `home-layout`, `content-grid` structural classNames only — feature components inside it are migrated in later tasks)

**Interfaces:**
- Consumes: theme tokens from Task 3.
- Produces: no more references to `.app-shell`, `.topbar`, `.topbar__brand`, `.brand-mark`, `.brand-text`, `.topbar__search`, `.topbar__actions`, `.topbar-btn`, `.btn-text`, `.home-layout`, `.content-grid`, `.primary-column`, `.secondary-column` in `index.css` or `App.tsx` — replaced by Tailwind utilities.

- [ ] **Step 1: Find the current rules for the shell classNames**

Run: `grep -n "\.app-shell\|\.topbar\|\.home-layout\|\.content-grid\|\.primary-column\|\.secondary-column\|\.brand-mark\|\.brand-text\|\.btn-text" src/index.css`

Read each matched rule (and its `@media` variants) to know the exact layout being reproduced: flex/grid direction, gaps, breakpoints, colors, the sticky/blur behavior of the topbar, etc.

- [ ] **Step 2: Rewrite `App.tsx`'s shell JSX with Tailwind utilities**

Replace each `className="..."` in the returned JSX (lines 215-259 and 273-303 as of this plan's writing) with Tailwind utility classes that reproduce the rules found in Step 1, using the Task 3 theme tokens (`bg-surface`, `border-line`, `rounded-card`, `shadow-glow-gold`, etc.) wherever the original rule referenced the matching CSS custom property. Preserve every existing responsive breakpoint (the codebase uses 430px/600px/760px/1024px min-width breakpoints — Tailwind's default `sm`/`md`/`lg`/`xl` do not line up with these, so use arbitrary breakpoints, e.g. `min-[760px]:grid-cols-2`, to match exactly rather than shifting the layout at a different width).

- [ ] **Step 3: Rewrite `StatusStates.tsx`**

Run: `grep -n "className=" src/shared/ui/StatusStates.tsx` to see its current classNames, then `grep -n "\.loading-state\|\.error-state\|\.toast" src/index.css` for their rules. Replace each className with the equivalent Tailwind utilities.

- [ ] **Step 4: Delete the now-dead CSS rules**

Remove every rule found in Step 1 and Step 3 from `src/index.css` (they have no remaining consumer after Steps 2-3).

- [ ] **Step 5: Verify visually and automatically**

Run: `npm run build && npm run lint && npm run test` — all green.

Run: `npm run dev`, open the app, and confirm: the header (brand, search bar, "Meu Time"/"Favoritos" buttons) looks the same, the two-column desktop layout still splits at the same width, the loading/error states and the toast still render correctly.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(tailwind): migrate app shell and shared UI states"
```

---

### Task 5: Migrate the `pokemon` feature to Tailwind

**Files:**
- Modify: `src/features/pokemon/components/PokemonCard.tsx`
- Modify: `src/features/pokemon/components/PokemonTabs.tsx`
- Modify: `src/features/pokemon/components/TypeBadges.tsx`
- Modify: `src/features/pokemon/components/AbilityDetailsDialog.tsx`

**Interfaces:**
- Consumes: theme tokens from Task 3, the pattern established in Task 4.
- Produces: no CSS rules for these components' classNames remain in `index.css`.

- [ ] **Step 1: Inventory the classNames**

Run: `grep -on "className=\"[^\"]*\"" src/features/pokemon/components/*.tsx | tr ' ' '\n' | grep -v "^className" | sort -u` — or simpler, open each of the 4 files and list every literal string passed to `className`.

- [ ] **Step 2: For each classNames, find and read its CSS rule**

For every distinct class from Step 1, run `grep -n "\.<class-name>" src/index.css` (also check `App.css`'s remnants moved into `index.css` in Task 3 if not yet migrated) and read the full rule including any type-badge color variants (`TypeBadges` renders per-type background colors — these come from a rule keyed by type name, e.g. `.type-badge--fire`; preserve all 18 type color variants).

- [ ] **Step 3: Replace each className with Tailwind utilities**

Work file by file: `TypeBadges.tsx` first (smallest, and consumed by the other three), then `PokemonCard.tsx`, `PokemonTabs.tsx`, `AbilityDetailsDialog.tsx`. For the 18 per-type colors in `TypeBadges`, keep the existing per-type color mapping object/logic in the component (however it currently maps type name → color) and only change what it outputs from a CSS class modifier to inline Tailwind arbitrary-value classes or a small `style` object driven by the same color values — do not hardcode 18 new Tailwind classes if the component already computes the color programmatically; preserve that mechanism.

- [ ] **Step 4: Delete the now-dead CSS**

Remove every migrated rule from `index.css`.

- [ ] **Step 5: Verify**

Run: `npm run build && npm run lint && npm run test` — all green.

Run: `npm run dev`, select several Pokémon of different types, and confirm: the card layout, stat bars, type badges (all colors), tabs (Info/Moves/etc.), and the ability dialog all render identically to before.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(tailwind): migrate pokemon feature components"
```

---

### Task 6: Migrate the `search` and `favorites` features to Tailwind

**Files:**
- Modify: `src/features/search/components/SearchExperience.tsx`
- Modify: `src/features/favorites/components/FavoritesDrawer.tsx`
- Modify: `src/features/favorites/components/FavoritesPanel.tsx`
- Modify: `src/features/favorites/components/RecentPokemonPanel.tsx`

**Interfaces:**
- Consumes: theme tokens from Task 3, `TypeBadges` from Task 5 (unchanged interface).
- Produces: no CSS rules for these components' classNames remain in `index.css`.

- [ ] **Step 1-4: Same procedure as Task 5**, applied to these 4 files: inventory classNames, read their CSS rules (search autocomplete dropdown, favorites drawer slide-in/backdrop, favorites/recent panel cards), replace with Tailwind utilities, delete the dead CSS.

Pay particular attention to the favorites drawer's open/close transition (likely a `transform: translateX(...)` with `transition`) — reproduce it with Tailwind's `translate-x-*` utilities plus `transition-transform`, conditioned on the `isOpen` prop already passed into the component (don't add new state).

- [ ] **Step 5: Verify**

Run: `npm run build && npm run lint && npm run test` — all green.

Run: `npm run dev`: type in the search box and confirm the autocomplete dropdown appears/positions correctly, open/close the favorites drawer and confirm the slide animation still works, confirm the recent-Pokémon panel renders on the home screen.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(tailwind): migrate search and favorites feature components"
```

---

### Task 7: Migrate the `team` and `type-analysis` features to Tailwind

**Files:**
- Modify: `src/features/team/components/AddToTeamDialog.tsx`
- Modify: `src/features/team/components/TeamLabAnalysis.tsx`
- Modify: `src/features/team/components/TeamPokemonEditor.tsx`
- Modify: `src/features/team/components/TeamSlotCard.tsx`
- Modify: `src/features/team/components/TeamLabView.tsx`
- Modify: `src/features/type-analysis/components/TeamAnalysisPanel.tsx`

**Interfaces:**
- Consumes: theme tokens from Task 3, `TypeBadges` from Task 5.
- Produces: no CSS rules for these components' classNames remain in `index.css`. This is the last feature-folder migration task — after this task, `index.css` should contain only the `@import "tailwindcss"`, the `@theme` block, and the `body` rule from Task 3 (verify with Step 3 below).

- [ ] **Step 1-2: Same procedure as Task 5**, applied to these 6 files (the largest group — `TeamPokemonEditor.tsx` and `TeamLabAnalysis.tsx` are the two biggest components in the codebase by line count, budget more time reading their current rules before rewriting).

- [ ] **Step 3: Confirm `index.css` is now pure Tailwind**

Run: `grep -c "^\." src/index.css`
Expected: `0` (no hand-written class selectors remain — everything is either the `@theme` block, `body`, or gone). If it's not zero, some component's classNames were missed; find them with `grep -n "^\." src/index.css` and trace which `.tsx` file still references them.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint && npm run test` — all green.

Run: `npm run dev`: open the Team Lab view, add a Pokémon to a team, edit its nature/EVs/held item in `TeamPokemonEditor`, check the type-coverage analysis panel — confirm everything renders and functions identically to before.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(tailwind): migrate team and type-analysis feature components"
```

---

### Task 8: Configure the PWA

**Files:**
- Modify: `vite.config.ts`
- Modify: `index.html`
- Create: `public/pwa-192x192.png`, `public/pwa-512x512.png` (generated from `public/favicon.svg`)

**Interfaces:**
- Produces: an installable PWA with offline caching for the PokeAPI and app shell.

- [ ] **Step 1: Generate PNG icons from the existing SVG favicon**

`vite-plugin-pwa`'s manifest needs raster icons. Run (requires no new dependency — Vite/Node can do this via a one-off script, or if ImageMagick/`rsvg-convert` is available use it directly):

```bash
npx --yes sharp-cli -i public/favicon.svg -o public/pwa-192x192.png resize 192 192
npx --yes sharp-cli -i public/favicon.svg -o public/pwa-512x512.png resize 512 512
```

If `sharp-cli` is unavailable in this environment, use whatever image tool is installed (ImageMagick's `convert favicon.svg -resize 192x192 pwa-192x192.png`) — the requirement is two PNGs at those exact dimensions in `public/`, not a specific tool.

- [ ] **Step 2: Add the plugin**

```bash
npm install -D vite-plugin-pwa
```

(it's already a listed dependency per `package.json` — run `npm ls vite-plugin-pwa` first; if already installed, skip this install and just configure it below)

- [ ] **Step 3: Configure `VitePWA` in `vite.config.ts`**

```diff
 import { defineConfig } from 'vite'
 import react from '@vitejs/plugin-react'
 import path from 'node:path'
 import tailwindcss from '@tailwindcss/vite'
+import { VitePWA } from 'vite-plugin-pwa'

 export default defineConfig({
-  plugins: [react(), tailwindcss()],
+  plugins: [
+    react(),
+    tailwindcss(),
+    VitePWA({
+      registerType: 'autoUpdate',
+      manifest: {
+        name: 'Archivum Arceus',
+        short_name: 'Arceus Dex',
+        description: 'PWA mobile-first para consulta, analise e montagem de times Pokemon.',
+        theme_color: '#070707',
+        background_color: '#070707',
+        display: 'standalone',
+        icons: [
+          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
+          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
+        ],
+      },
+      workbox: {
+        runtimeCaching: [
+          {
+            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/,
+            handler: 'StaleWhileRevalidate',
+            options: { cacheName: 'pokeapi-cache' },
+          },
+          {
+            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/.*/,
+            handler: 'StaleWhileRevalidate',
+            options: { cacheName: 'pokeapi-sprites-cache' },
+          },
+        ],
+      },
+    }),
+  ],
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   },
 })
```

Before finalizing, run `grep -rn "https://" src/shared/services/pokeapi/client.ts` to confirm the exact base URL(s) the app fetches sprites/data from, and adjust the two `urlPattern` regexes above if the actual host differs from `pokeapi.co` / `raw.githubusercontent.com`.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: build succeeds and `dist/` now contains a generated `sw.js` and `manifest.webmanifest`.

Run: `npm run preview`, open the app in Chrome DevTools → Application tab, and confirm: a manifest is detected, a service worker is registered and activated.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure PWA manifest and offline caching"
```

---

### Task 9: Add store tests

**Files:**
- Modify: `vite.config.ts` (add `test.environment`)
- Create: `src/features/favorites/store/favoritesStore.test.ts`
- Create: `src/features/team/store/teamStore.test.ts`
- Create: `src/features/search/store/searchHistoryStore.test.ts`

**Interfaces:**
- Consumes: `useFavoritesStore` (`favoritePokemonIds: number[]`, `toggleFavorite(id): void`, `isFavorite(id): boolean`), `useTeamStore` (`activeTeamId`, `teams`, `setActiveTeam`, `addPokemon`, `addPokemonToTeam`, `updatePokemonInTeam`, `removePokemon`, `renameTeam`, `clearTeam`, `exportActiveTeam`, `importTeam`), `useSearchHistoryStore` (`history: string[]`, `addSearch(value): void`, `clearHistory(): void`) — exact signatures as they exist today in `src/features/*/store/*.ts`.

- [ ] **Step 1: Install jsdom (needed for any future component tests; also required by some zustand/persist code paths that touch `window`)**

```bash
npm install -D jsdom
```

- [ ] **Step 2: Configure the test environment**

```diff
 export default defineConfig({
   plugins: [react(), tailwindcss(), VitePWA(/* ... */)],
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   },
+  test: {
+    environment: 'jsdom',
+  },
 })
```

- [ ] **Step 3: Write `favoritesStore.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from './favoritesStore'

beforeEach(() => {
  useFavoritesStore.setState({ favoritePokemonIds: [] })
})

describe('favoritesStore', () => {
  it('starts with no favorites', () => {
    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([])
  })

  it('adds a pokemon on toggle when not favorited', () => {
    useFavoritesStore.getState().toggleFavorite(25)

    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([25])
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(true)
  })

  it('removes a pokemon on toggle when already favorited', () => {
    useFavoritesStore.getState().toggleFavorite(25)
    useFavoritesStore.getState().toggleFavorite(25)

    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([])
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(false)
  })

  it('tracks multiple favorites independently', () => {
    useFavoritesStore.getState().toggleFavorite(25)
    useFavoritesStore.getState().toggleFavorite(6)

    expect(useFavoritesStore.getState().favoritePokemonIds).toEqual([25, 6])
  })
})
```

- [ ] **Step 4: Run it**

Run: `npx vitest run src/features/favorites/store/favoritesStore.test.ts`
Expected: 4/4 passing.

- [ ] **Step 5: Write `searchHistoryStore.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useSearchHistoryStore } from './searchHistoryStore'

beforeEach(() => {
  useSearchHistoryStore.setState({ history: [] })
})

describe('searchHistoryStore', () => {
  it('adds a normalized search term', () => {
    useSearchHistoryStore.getState().addSearch('  Pikachu  ')

    expect(useSearchHistoryStore.getState().history).toEqual(['pikachu'])
  })

  it('ignores an empty search term', () => {
    useSearchHistoryStore.getState().addSearch('   ')

    expect(useSearchHistoryStore.getState().history).toEqual([])
  })

  it('moves a repeated term to the front instead of duplicating it', () => {
    useSearchHistoryStore.getState().addSearch('pikachu')
    useSearchHistoryStore.getState().addSearch('charizard')
    useSearchHistoryStore.getState().addSearch('pikachu')

    expect(useSearchHistoryStore.getState().history).toEqual(['pikachu', 'charizard'])
  })

  it('caps history at 20 entries', () => {
    for (let i = 0; i < 25; i += 1) {
      useSearchHistoryStore.getState().addSearch(`pokemon-${i}`)
    }

    expect(useSearchHistoryStore.getState().history).toHaveLength(20)
    expect(useSearchHistoryStore.getState().history[0]).toBe('pokemon-24')
  })

  it('clears history', () => {
    useSearchHistoryStore.getState().addSearch('pikachu')
    useSearchHistoryStore.getState().clearHistory()

    expect(useSearchHistoryStore.getState().history).toEqual([])
  })
})
```

- [ ] **Step 6: Run it**

Run: `npx vitest run src/features/search/store/searchHistoryStore.test.ts`
Expected: 5/5 passing.

- [ ] **Step 7: Write `teamStore.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useTeamStore, MAX_TEAMS, TEAM_SIZE } from './teamStore'
import type { TeamPokemon } from '@/shared/types/team'

const pikachu: TeamPokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  sprite: '',
  types: ['electric'],
}

beforeEach(() => {
  useTeamStore.persist.clearStorage()
  useTeamStore.setState(useTeamStore.getInitialState(), true)
})

describe('teamStore', () => {
  it('starts with MAX_TEAMS empty teams', () => {
    const { teams } = useTeamStore.getState()

    expect(teams).toHaveLength(MAX_TEAMS)
    expect(teams[0].slots).toHaveLength(TEAM_SIZE)
    expect(teams[0].slots.every((slot) => slot.pokemon === null)).toBe(true)
  })

  it('adds a pokemon to the active team in the first empty slot', () => {
    const wasAdded = useTeamStore.getState().addPokemon(pikachu)

    expect(wasAdded).toBe(true)
    const activeTeam = useTeamStore.getState().getActiveTeam()
    expect(activeTeam.slots[0].pokemon?.name).toBe('pikachu')
  })

  it('does not add a pokemon when the active team is full', () => {
    for (let i = 0; i < TEAM_SIZE; i += 1) {
      useTeamStore.getState().addPokemon(pikachu)
    }

    const wasAdded = useTeamStore.getState().addPokemon(pikachu)

    expect(wasAdded).toBe(false)
  })

  it('removes a pokemon from a slot', () => {
    useTeamStore.getState().addPokemon(pikachu)
    useTeamStore.getState().removePokemon(0)

    const activeTeam = useTeamStore.getState().getActiveTeam()
    expect(activeTeam.slots[0].pokemon).toBeNull()
  })

  it('renames a team, falling back to the default name when blank', () => {
    const teamId = useTeamStore.getState().activeTeamId

    useTeamStore.getState().renameTeam(teamId, 'Aces')
    expect(useTeamStore.getState().getActiveTeam().name).toBe('Aces')

    useTeamStore.getState().renameTeam(teamId, '   ')
    expect(useTeamStore.getState().getActiveTeam().name).toBe('Aces')
  })

  it('clears a team back to empty slots', () => {
    useTeamStore.getState().addPokemon(pikachu)
    useTeamStore.getState().clearTeam()

    const activeTeam = useTeamStore.getState().getActiveTeam()
    expect(activeTeam.slots.every((slot) => slot.pokemon === null)).toBe(true)
  })

  it('exports and re-imports a team round-trip', () => {
    useTeamStore.getState().addPokemon(pikachu)
    const exported = useTeamStore.getState().exportActiveTeam()

    useTeamStore.getState().clearTeam()
    const wasImported = useTeamStore.getState().importTeam(exported)

    expect(wasImported).toBe(true)
    expect(useTeamStore.getState().getActiveTeam().slots[0].pokemon?.name).toBe('pikachu')
  })

  it('rejects an unparseable import payload', () => {
    const wasImported = useTeamStore.getState().importTeam('not json')

    expect(wasImported).toBe(false)
  })
})
```

- [ ] **Step 8: Run it**

Run: `npx vitest run src/features/team/store/teamStore.test.ts`
Expected: 8/8 passing. If `useTeamStore.getInitialState` or `useTeamStore.persist.clearStorage` don't exist on this zustand version, run `npm ls zustand` to confirm the installed version and check its persist middleware API — both are standard zustand v4/v5 APIs, but if the reset approach fails, replace `beforeEach` with manually rebuilding the default state: `useTeamStore.setState({ activeTeamId: 'team-1', teams: createDefaultTeams() })` (note `createDefaultTeams` is not exported from `teamStore.ts` today — if going this route, export it, since the test needs a fresh team array each run, not a shared mutable reference).

- [ ] **Step 9: Full suite verification**

Run: `npm run build && npm run lint && npm run test`
Expected: all green, test count increased by 17 (4 + 5 + 8) over the pre-Task-9 baseline.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "test: add coverage for favorites, search history, and team stores"
```

---

### Task 10: Docker production build

**Files:**
- Create: `arce-dex/Dockerfile`
- Create: `arce-dex/.dockerignore`

**Interfaces:**
- Produces: a `Dockerfile` that builds `arce-dex` and serves the static output via nginx on port 80.

- [ ] **Step 1: Write `.dockerignore`**

```
node_modules
dist
.git
*.log
```

- [ ] **Step 2: Write the multi-stage `Dockerfile`**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Write the nginx SPA-fallback config**

Create `arce-dex/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 4: Build and run the image to verify**

Run (from `arce-dex/`): `docker build -t arce-dex:local .`
Expected: build succeeds.

Run: `docker run --rm -p 8080:80 arce-dex:local` then `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/`
Expected: `200`. Stop the container after confirming (Ctrl+C or `docker stop` in another shell).

If Docker isn't available in this environment, skip Step 4's execution but still write the files — note in the commit message that the build was not locally verified, and flag this to the user before considering the task done.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile .dockerignore nginx.conf
git commit -m "chore: add Docker production build"
```

---

### Task 11: CI pipeline

**Files:**
- Create: `.github/workflows/ci.yml` (repo root, not `arce-dex/`)

**Interfaces:**
- Produces: a GitHub Actions workflow running lint, test, and build on every push/PR to `dev` and `main`.

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: arce-dex
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: arce-dex/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

- [ ] **Step 2: Verify the YAML is well-formed**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` (or any available YAML parser) to catch indentation errors before pushing — a broken workflow file fails silently on GitHub's side until the next push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint, test, and build workflow"
```

---

### Task 12: Error boundary and React Query devtools

**Files:**
- Create: `src/app/AppErrorFallback.tsx`
- Modify: `src/app/providers.tsx`
- Modify: `package.json` (via npm install)

**Interfaces:**
- Produces: `AppErrorFallback` component (props: `{ error: Error; resetErrorBoundary: () => void }`, matching `react-error-boundary`'s `FallbackComponent` contract) and a dev-only React Query devtools panel mounted inside `Providers`.

- [ ] **Step 1: Install dependencies**

```bash
npm install react-error-boundary
npm install -D @tanstack/react-query-devtools
```

- [ ] **Step 2: Write the fallback component**

```tsx
type AppErrorFallbackProps = {
  error: Error
  resetErrorBoundary: () => void
}

export function AppErrorFallback({ error, resetErrorBoundary }: AppErrorFallbackProps) {
  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cosmic p-8 text-center text-ivory">
      <p className="text-lg font-semibold">Algo deu errado.</p>
      <p className="text-sm text-muted">{error.message}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-control border border-line-gold px-4 py-2 text-sm text-gold"
      >
        Tentar novamente
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Wire it into `providers.tsx`**

```diff
 import type { PropsWithChildren } from 'react'
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
+import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
+import { ErrorBoundary } from 'react-error-boundary'
+import { AppErrorFallback } from './AppErrorFallback'

 const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       staleTime: 1000 * 60 * 10,
       gcTime: 1000 * 60 * 60,
       retry: 1,
       refetchOnWindowFocus: false,
     },
   },
 })

 export function Providers({ children }: PropsWithChildren) {
   return (
-    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
+    <ErrorBoundary FallbackComponent={AppErrorFallback}>
+      <QueryClientProvider client={queryClient}>
+        {children}
+        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
+      </QueryClientProvider>
+    </ErrorBoundary>
   )
 }
```

- [ ] **Step 4: Verify the devtools panel is excluded from the production bundle**

Run: `npm run build && grep -c "ReactQueryDevtools" dist/assets/*.js`

Expected: `0` — the `import.meta.env.DEV` check must be dead-code-eliminated by Vite's production build. If it's not `0`, the devtools import is happening unconditionally somewhere; check that `ReactQueryDevtools` is only referenced inside the `import.meta.env.DEV &&` expression and not imported elsewhere.

- [ ] **Step 5: Verify lint/test and manually confirm the devtools panel appears in dev**

Run: `npm run lint && npm run test` — both green.

Run: `npm run dev`, confirm the React Query devtools toggle appears in the browser (bottom of the screen).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add error boundary and dev-only React Query devtools"
```

---

## Final Verification

- [ ] Run `npm run build && npm run lint && npm run test` one final time — all green.
- [ ] Run `npm run dev` and manually smoke-test the full golden path: search a Pokémon, view its card/tabs, favorite it, add it to a team, edit it in the team lab, check the type-analysis panel, open/close the favorites drawer, trigger a toast.
- [ ] Confirm `grep -c "^\." src/index.css` is `0` (Tailwind migration fully replaced hand-written CSS).
- [ ] Confirm `docker build -t arce-dex:local arce-dex/` succeeds (if Docker was unavailable during Task 10, run it now).
- [ ] Confirm `git log --oneline -13` shows all 12 task commits in order (13 including this plan's own doc commit, if any).

## Execution ruling log

Ruling (Task 3, Step 4): the plan as written replaced all of `index.css` with just the Tailwind import + theme, which would delete every hand-written rule before any component (Tasks 4-7) had been migrated to Tailwind utilities — breaking the entire visual layout for several commits. Corrected at execution time: `@import "tailwindcss";` and the `@theme` block are prepended to the top of `index.css`, and every existing hand-written rule is kept in place below them. Each subsequent migration task (4-7) deletes only the rules it just replaced, as already specified in those tasks' "delete the now-dead CSS" steps. Cost if wrong: none — Task 7's Step 3 already verifies `index.css` ends up with zero hand-written selectors, so the end state is identical either way; this only fixes the intermediate broken-visual-state risk.

## Session pause (2026-09-19)

Progress so far: Task 1 (TS strict) done, Task 2 (App.tsx hooks split) done, Task 3 (Tailwind install) done, Task 4 (shell + shared/ui migration) done, Task 5 in progress — TypeBadges migrated and committed; PokemonCard.tsx, PokemonTabs.tsx, AbilityDetailsDialog.tsx still pending (CSS classes read but not yet converted).

User paused the session before deciding pixel-perfect vs. fast-approximate pace for the remaining Tailwind migration (Tasks 5-7 cover ~14 more components, several large — TeamPokemonEditor.tsx and TeamLabAnalysis.tsx are the biggest). Resume by asking the user which pace they want before continuing Task 5.

No browser tool was available this session (extension not connected) — all verification was build/lint/test only, no visual screenshot confirmation. Flag this to the user when resuming.
