# Supabase Auth + Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (executed inline by the controller, no subagents). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase-backed email/password auth with real-time cross-device sync for favorites, teams, search history, and settings — while keeping the app fully functional offline/logged-out exactly as today.

**Architecture:** A new `features/auth` feature owns the session (Supabase Auth + a `authStore`). A new `useCloudSync()` hook, mounted once in `App`, is the only other code that talks to Supabase — it pulls/merges on login, subscribes to Realtime changes, and pushes local mutations. The four existing stores (`favoritesStore`, `teamStore`, `searchHistoryStore`, `settingsStore`) are not modified — sync is a layer bolted on top via `.subscribe()` and `.setState()`, so logged-out behavior is untouched.

**Tech Stack:** `@supabase/supabase-js`, Supabase Postgres + Auth + Realtime, existing Zustand stores.

**Spec:** `docs/superpowers/specs/2026-09-20-supabase-sync-design.md`

## Global Constraints

- No behavior change when logged out — every store keeps working exactly as it does today via localForage.
- Merge rule on login: no remote row for this user → push local up. Remote row exists → remote overwrites local. No field-level merge.
- Auth: email/password only, email confirmation required (already the Supabase project default — verify, don't assume).
- All 5 tables get RLS (`auth.uid() = user_id`, or via join for `team_slots`) and are added to the `supabase_realtime` publication.
- Every task ends green on `npm run build`, `npm run lint`, `npm run test` (run from `arce-dex/`).
- The Supabase MCP server is connected in **read-only** mode. Task 2 requires write access — re-register it without `--read-only` for that task only (see Task 2), and confirm with the user before applying schema changes (irreversible-ish, shared infra).

---

### Task 1: Supabase client and env setup

**Files:**
- Create: `src/shared/services/supabase/client.ts`
- Modify: `arce-dex/.env.example`
- Modify: `arce-dex/.env` (local only, not committed)
- Modify: `package.json` (via npm install)

**Interfaces:**
- Produces: `supabase` — a singleton `SupabaseClient` instance, importable as `import { supabase } from '@/shared/services/supabase/client'`.

- [ ] **Step 1: Get the project URL and anon key**

Run (Supabase MCP tools, already connected):
- `mcp__supabase__get_project_url` → `https://dddjlzixsseacqdrepfq.supabase.co` (confirmed earlier this session)
- `mcp__supabase__get_publishable_keys` → use the `anon` legacy key or the `sb_publishable_...` key, whichever `disabled` is not `true`.

- [ ] **Step 2: Install the client library**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 3: Add env vars**

`arce-dex/.env.example` (append):
```
VITE_SUPABASE_URL=https://dddjlzixsseacqdrepfq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

`arce-dex/.env` (append, real values from Step 1 — this file is gitignored, never commit it):
```
VITE_SUPABASE_URL=https://dddjlzixsseacqdrepfq.supabase.co
VITE_SUPABASE_ANON_KEY=<the real key from Step 1>
```

- [ ] **Step 4: Write the client**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 5: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green (nothing imports `supabase` yet, so this just confirms the new file compiles standalone — add a throwaway `console.log(supabase)` in `main.tsx` temporarily if you want to smoke-test the client resolves, then remove it before committing).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Supabase client"
```

---

### Task 2: Database schema, RLS, and Realtime

**Files:**
- Create: `arce-dex/supabase/migrations/20260920000000_sync_schema.sql` (kept in the repo per the GitHub integration's `working directory: arce-dex`, so future pushes to `main` auto-apply new migrations)

**Interfaces:**
- Produces: tables `public.favorites`, `public.teams`, `public.team_slots`, `public.search_history`, `public.settings`, all RLS-protected and Realtime-enabled.

- [ ] **Step 1: Confirm email confirmation is on**

Run `mcp__supabase__search_docs` is not needed here — just check the dashboard: **Authentication → Providers → Email → "Confirm email"** should be enabled. If it's off, turn it on before continuing (this is a dashboard toggle, not SQL).

- [ ] **Step 2: Write the migration file**

`arce-dex/supabase/migrations/20260920000000_sync_schema.sql`:

```sql
create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  pokemon_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, pokemon_id)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_team_id text not null,
  name text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, client_team_id)
);

create table public.team_slots (
  team_id uuid not null references public.teams(id) on delete cascade,
  slot_index integer not null check (slot_index >= 0 and slot_index < 6),
  pokemon jsonb,
  updated_at timestamptz not null default now(),
  primary key (team_id, slot_index)
);

create table public.search_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  searched_at timestamptz not null default now(),
  primary key (user_id, term)
);

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system',
  updated_at timestamptz not null default now()
);

alter table public.favorites enable row level security;
create policy "own rows only" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.teams enable row level security;
create policy "own rows only" on public.teams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.team_slots enable row level security;
create policy "own rows only" on public.team_slots
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  );

alter table public.search_history enable row level security;
create policy "own rows only" on public.search_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.settings enable row level security;
create policy "own rows only" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table
  public.favorites, public.teams, public.team_slots, public.search_history, public.settings;
```

- [ ] **Step 3: Re-register the Supabase MCP server with write access**

This is a schema change to shared infrastructure — **stop and ask the user to confirm** before running Step 4. Once confirmed:

```bash
claude mcp remove supabase
claude mcp add supabase -e SUPABASE_ACCESS_TOKEN=<token> -- npx -y @supabase/mcp-server-supabase@latest --project-ref=dddjlzixsseacqdrepfq
```

(same token as before, just drop `--read-only`). Requires a Claude Code restart to pick up.

- [ ] **Step 4: Apply the migration**

Use the Supabase MCP's migration tool (search for it once the write-enabled server is connected — it was hidden in read-only mode; look for a tool named `apply_migration` or similar via `ToolSearch` with query "supabase migration"). Pass the file's contents as the migration body with name `sync_schema`.

- [ ] **Step 5: Verify**

Run (Supabase MCP): `mcp__supabase__list_tables` with `schemas: ["public"]`
Expected: 5 tables listed: `favorites`, `teams`, `team_slots`, `search_history`, `settings`.

Run: `mcp__supabase__get_advisors` with `type: "security"`
Expected: no RLS-related warnings for the 5 new tables.

- [ ] **Step 6: Re-register the MCP server back to read-only**

```bash
claude mcp remove supabase
claude mcp add supabase -e SUPABASE_ACCESS_TOKEN=<token> -- npx -y @supabase/mcp-server-supabase@latest --project-ref=dddjlzixsseacqdrepfq --read-only
```

Restart Claude Code again. This keeps write access scoped to only when a migration is actually being applied.

- [ ] **Step 7: Commit**

```bash
git add arce-dex/supabase/migrations/20260920000000_sync_schema.sql
git commit -m "feat: add Supabase schema, RLS, and Realtime for sync tables"
```

---

### Task 3: Auth feature

**Files:**
- Create: `src/features/auth/store/authStore.ts`
- Create: `src/features/auth/components/AuthForm.tsx`
- Create: `src/features/auth/index.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `useAuthStore()` returning `{ status: 'loading' | 'authenticated' | 'anonymous', session: Session | null, user: User | null }` (types from `@supabase/supabase-js`).
- Produces: `AuthForm` component (props: `{ onClose: () => void }`) — a modal-style form handling both sign-up and sign-in, toggled internally.
- Produces: barrel `@/features/auth` exporting `useAuthStore`, `AuthForm`.

- [ ] **Step 1: Write `authStore`**

```ts
import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/shared/services/supabase/client'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthStore = {
  status: AuthStatus
  session: Session | null
  user: User | null
}

export const useAuthStore = create<AuthStore>(() => ({
  status: 'loading',
  session: null,
  user: null,
}))

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    status: session ? 'authenticated' : 'anonymous',
    session,
    user: session?.user ?? null,
  })
})
```

- [ ] **Step 2: Write `AuthForm`**

```tsx
import { useState } from 'react'
import { supabase } from '@/shared/services/supabase/client'

type AuthFormProps = {
  onClose: () => void
}

export function AuthForm({ onClose }: AuthFormProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: authError } =
      mode === 'sign-up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

    setIsSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'sign-up') {
      setConfirmationSent(true)
      return
    }

    onClose()
  }

  if (confirmationSent) {
    return (
      <div
        className="fixed inset-0 z-[34] grid items-end bg-[rgba(2,6,23,0.64)] p-2.5 min-[760px]:items-center"
        role="presentation"
      >
        <section className="mx-auto grid w-[min(420px,100%)] gap-3 rounded-2xl border border-line bg-[rgba(9,13,20,0.98)] p-5 text-ivory">
          <h2>Confirme seu email</h2>
          <p className="text-ivory-soft">
            Enviamos um link de confirmação para {email}. Clique nele antes de entrar.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control border border-line-gold px-4 py-2 text-sm text-gold"
          >
            Fechar
          </button>
        </section>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[34] grid items-end bg-[rgba(2,6,23,0.64)] p-2.5 min-[760px]:items-center"
      role="presentation"
    >
      <section className="mx-auto grid w-[min(420px,100%)] gap-3 rounded-2xl border border-line bg-[rgba(9,13,20,0.98)] p-5 text-ivory">
        <header className="flex items-center justify-between gap-3">
          <h2>{mode === 'sign-up' ? 'Criar conta' : 'Entrar'}</h2>
          <button type="button" onClick={onClose} className="text-ivory-soft">
            Fechar
          </button>
        </header>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1.5 text-[0.78rem] font-extrabold">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full min-h-[46px] rounded-xl border border-line bg-[rgba(18,22,32,0.6)] px-2.5 py-2 text-ivory"
            />
          </label>
          <label className="grid gap-1.5 text-[0.78rem] font-extrabold">
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full min-h-[46px] rounded-xl border border-line bg-[rgba(18,22,32,0.6)] px-2.5 py-2 text-ivory"
            />
          </label>
          {error && <p className="text-sm text-[#fecdd3]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[46px] items-center justify-center rounded-control border border-line-gold bg-[rgba(212,175,55,0.16)] font-extrabold text-ivory disabled:opacity-50"
          >
            {mode === 'sign-up' ? 'Criar conta' : 'Entrar'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
          className="text-sm text-gold"
        >
          {mode === 'sign-up' ? 'Já tenho conta' : 'Criar conta nova'}
        </button>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Write the barrel**

`src/features/auth/index.ts`:
```ts
export { useAuthStore } from './store/authStore'
export { AuthForm } from './components/AuthForm'
```

- [ ] **Step 4: Wire into `App.tsx`**

Add state for the auth dialog and a header button. In `src/app/App.tsx`:

```diff
+import { AuthForm, useAuthStore } from '@/features/auth'
```

Add local state near the top of `App()` (after `const dialogs = useAppDialogs()`):
```ts
  const authStatus = useAuthStore((state) => state.status)
  const authUser = useAuthStore((state) => state.user)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
```
(add `useState` to the existing `import { useMemo } from 'react'` → `import { useMemo, useState } from 'react'`)

In the header's actions div (after the Favoritos button), add:
```tsx
          {authStatus === 'authenticated' ? (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(246,237,211,0.12)] bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft"
              title={authUser?.email ?? 'Sair'}
            >
              Sair
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(246,237,211,0.12)] bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft"
            >
              Entrar
            </button>
          )}
```

(needs `import { supabase } from '@/shared/services/supabase/client'` added too)

Render the dialog near the other dialogs at the bottom of the JSX (after `<AbilityDetailsDialog .../>`):
```tsx
      {isAuthOpen && <AuthForm onClose={() => setIsAuthOpen(false)} />}
```

- [ ] **Step 5: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

Run: `npm run dev`, click "Entrar", create an account with a real email you control, confirm you see the "confirme seu email" message, check your inbox for the confirmation link, click it, then sign in.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add email/password auth"
```

---

### Task 4: Sync decision helper (pure logic, tested)

**Files:**
- Create: `src/app/cloudSync/decideSyncStrategy.ts`
- Create: `src/app/cloudSync/decideSyncStrategy.test.ts`

**Interfaces:**
- Produces: `decideSyncStrategy(remoteRows: unknown[]): 'push' | 'pull'` — pure function, no I/O.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { decideSyncStrategy } from './decideSyncStrategy'

describe('decideSyncStrategy', () => {
  it('returns push when there are no remote rows (first sync)', () => {
    expect(decideSyncStrategy([])).toBe('push')
  })

  it('returns pull when remote rows already exist', () => {
    expect(decideSyncStrategy([{ id: 1 }])).toBe('pull')
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/app/cloudSync/decideSyncStrategy.test.ts`
Expected: FAIL — `decideSyncStrategy` is not defined (file doesn't exist yet).

- [ ] **Step 3: Implement**

```ts
export function decideSyncStrategy(remoteRows: unknown[]): 'push' | 'pull' {
  return remoteRows.length === 0 ? 'push' : 'pull'
}
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `npx vitest run src/app/cloudSync/decideSyncStrategy.test.ts`
Expected: 2/2 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pure sync-strategy decision helper with tests"
```

---

### Task 5: Cloud sync for favorites and search history (multi-row tables)

**Files:**
- Create: `src/app/cloudSync/syncFavorites.ts`
- Create: `src/app/cloudSync/syncSearchHistory.ts`

**Interfaces:**
- Consumes: `decideSyncStrategy` from Task 4, `useFavoritesStore`/`useSearchHistoryStore` from their features, `supabase` client from Task 1.
- Produces: `startFavoritesSync(userId: string): () => void` and `startSearchHistorySync(userId: string): () => void` — each starts pull/merge + Realtime subscribe + local-write push, returns an unsubscribe function.

- [ ] **Step 1: Write `syncFavorites.ts`**

```ts
import { supabase } from '@/shared/services/supabase/client'
import { useFavoritesStore } from '@/features/favorites'
import { decideSyncStrategy } from './decideSyncStrategy'

export async function startFavoritesSync(userId: string): Promise<() => void> {
  const { data: remoteRows } = await supabase
    .from('favorites')
    .select('pokemon_id')
    .eq('user_id', userId)

  const strategy = decideSyncStrategy(remoteRows ?? [])

  if (strategy === 'push') {
    const localIds = useFavoritesStore.getState().favoritePokemonIds
    if (localIds.length > 0) {
      await supabase
        .from('favorites')
        .insert(localIds.map((pokemonId) => ({ user_id: userId, pokemon_id: pokemonId })))
    }
  } else {
    const remoteIds = (remoteRows ?? []).map((row) => row.pokemon_id as number)
    useFavoritesStore.setState({ favoritePokemonIds: remoteIds })
  }

  let isApplyingRemote = false

  const channel = supabase
    .channel(`favorites-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${userId}` },
      async () => {
        isApplyingRemote = true
        const { data } = await supabase.from('favorites').select('pokemon_id').eq('user_id', userId)
        useFavoritesStore.setState({ favoritePokemonIds: (data ?? []).map((row) => row.pokemon_id as number) })
        isApplyingRemote = false
      },
    )
    .subscribe()

  let previousIds = useFavoritesStore.getState().favoritePokemonIds

  const unsubscribeStore = useFavoritesStore.subscribe((state) => {
    if (isApplyingRemote) {
      previousIds = state.favoritePokemonIds
      return
    }

    const added = state.favoritePokemonIds.filter((id) => !previousIds.includes(id))
    const removed = previousIds.filter((id) => !state.favoritePokemonIds.includes(id))
    previousIds = state.favoritePokemonIds

    added.forEach((pokemonId) => {
      void supabase.from('favorites').insert({ user_id: userId, pokemon_id: pokemonId })
    })
    removed.forEach((pokemonId) => {
      void supabase.from('favorites').delete().eq('user_id', userId).eq('pokemon_id', pokemonId)
    })
  })

  return () => {
    unsubscribeStore()
    void supabase.removeChannel(channel)
  }
}
```

- [ ] **Step 2: Write `syncSearchHistory.ts`**

```ts
import { supabase } from '@/shared/services/supabase/client'
import { useSearchHistoryStore } from '@/features/search'
import { decideSyncStrategy } from './decideSyncStrategy'

export async function startSearchHistorySync(userId: string): Promise<() => void> {
  const { data: remoteRows } = await supabase
    .from('search_history')
    .select('term, searched_at')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })

  const strategy = decideSyncStrategy(remoteRows ?? [])

  if (strategy === 'push') {
    const localTerms = useSearchHistoryStore.getState().history
    if (localTerms.length > 0) {
      await supabase
        .from('search_history')
        .insert(localTerms.map((term) => ({ user_id: userId, term })))
    }
  } else {
    useSearchHistoryStore.setState({ history: (remoteRows ?? []).map((row) => row.term as string) })
  }

  let isApplyingRemote = false

  const channel = supabase
    .channel(`search-history-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'search_history', filter: `user_id=eq.${userId}` },
      async () => {
        isApplyingRemote = true
        const { data } = await supabase
          .from('search_history')
          .select('term, searched_at')
          .eq('user_id', userId)
          .order('searched_at', { ascending: false })
        useSearchHistoryStore.setState({ history: (data ?? []).map((row) => row.term as string) })
        isApplyingRemote = false
      },
    )
    .subscribe()

  let previousTerms = useSearchHistoryStore.getState().history

  const unsubscribeStore = useSearchHistoryStore.subscribe((state) => {
    if (isApplyingRemote) {
      previousTerms = state.history
      return
    }

    const addedTerms = state.history.filter((term) => !previousTerms.includes(term))
    previousTerms = state.history

    addedTerms.forEach((term) => {
      void supabase.from('search_history').upsert({ user_id: userId, term, searched_at: new Date().toISOString() })
    })
  })

  return () => {
    unsubscribeStore()
    void supabase.removeChannel(channel)
  }
}
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green (these files aren't wired into the app yet, so this only confirms they compile standalone).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add cloud sync for favorites and search history"
```

---

### Task 6: Cloud sync for teams and settings (entity-shaped tables)

**Files:**
- Create: `src/app/cloudSync/syncTeams.ts`
- Create: `src/app/cloudSync/syncSettings.ts`

**Interfaces:**
- Consumes: same as Task 5, plus `useTeamStore` from `@/features/team`, `useSettingsStore` from `@/shared/stores/settingsStore`, `Team`/`TeamSlot` types from `@/shared/types/team`.
- Produces: `startTeamsSync(userId: string): () => void`, `startSettingsSync(userId: string): () => void`.

- [ ] **Step 1: Write `syncSettings.ts`** (simplest entity table — do this one first to confirm the pattern)

```ts
import { supabase } from '@/shared/services/supabase/client'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import { decideSyncStrategy } from './decideSyncStrategy'

export async function startSettingsSync(userId: string): Promise<() => void> {
  const { data: remoteRows } = await supabase.from('settings').select('theme').eq('user_id', userId)
  const strategy = decideSyncStrategy(remoteRows ?? [])

  if (strategy === 'push') {
    const theme = useSettingsStore.getState().theme
    await supabase.from('settings').insert({ user_id: userId, theme })
  } else {
    const theme = (remoteRows ?? [])[0]?.theme as string | undefined
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      useSettingsStore.setState({ theme })
    }
  }

  let isApplyingRemote = false

  const channel = supabase
    .channel(`settings-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: `user_id=eq.${userId}` },
      async () => {
        isApplyingRemote = true
        const { data } = await supabase.from('settings').select('theme').eq('user_id', userId).maybeSingle()
        const theme = data?.theme as string | undefined
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
          useSettingsStore.setState({ theme })
        }
        isApplyingRemote = false
      },
    )
    .subscribe()

  const unsubscribeStore = useSettingsStore.subscribe((state) => {
    if (isApplyingRemote) {
      return
    }

    void supabase
      .from('settings')
      .upsert({ user_id: userId, theme: state.theme, updated_at: new Date().toISOString() })
  })

  return () => {
    unsubscribeStore()
    void supabase.removeChannel(channel)
  }
}
```

- [ ] **Step 2: Write `syncTeams.ts`**

```ts
import { supabase } from '@/shared/services/supabase/client'
import { useTeamStore } from '@/features/team'
import { decideSyncStrategy } from './decideSyncStrategy'
import type { Team, TeamPokemon } from '@/shared/types/team'

type RemoteTeamRow = { id: string; client_team_id: string; name: string }
type RemoteSlotRow = { team_id: string; slot_index: number; pokemon: TeamPokemon | null }

async function fetchRemoteTeams(userId: string) {
  const { data: teamRows } = await supabase
    .from('teams')
    .select('id, client_team_id, name')
    .eq('user_id', userId)

  if (!teamRows || teamRows.length === 0) {
    return []
  }

  const { data: slotRows } = await supabase
    .from('team_slots')
    .select('team_id, slot_index, pokemon')
    .in('team_id', teamRows.map((row) => row.id))

  return teamRows.map((teamRow) => buildTeam(teamRow, slotRows ?? []))
}

function buildTeam(teamRow: RemoteTeamRow, slotRows: RemoteSlotRow[]): Team {
  const slots = Array.from({ length: 6 }, (_, index) => {
    const slotRow = slotRows.find((row) => row.team_id === teamRow.id && row.slot_index === index)
    return { id: `${teamRow.client_team_id}-slot-${index + 1}`, pokemon: slotRow?.pokemon ?? null }
  })

  return { id: teamRow.client_team_id, name: teamRow.name, slots }
}

async function pushTeam(userId: string, team: Team) {
  const { data: upserted } = await supabase
    .from('teams')
    .upsert(
      { user_id: userId, client_team_id: team.id, name: team.name, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,client_team_id' },
    )
    .select('id')
    .single()

  if (!upserted) {
    return
  }

  await supabase.from('team_slots').upsert(
    team.slots.map((slot, index) => ({
      team_id: upserted.id,
      slot_index: index,
      pokemon: slot.pokemon,
      updated_at: new Date().toISOString(),
    })),
  )
}

export async function startTeamsSync(userId: string): Promise<() => void> {
  const { data: remoteTeamRows } = await supabase.from('teams').select('id').eq('user_id', userId)
  const strategy = decideSyncStrategy(remoteTeamRows ?? [])

  if (strategy === 'push') {
    const localTeams = useTeamStore.getState().teams
    for (const team of localTeams) {
      await pushTeam(userId, team)
    }
  } else {
    const remoteTeams = await fetchRemoteTeams(userId)
    if (remoteTeams.length > 0) {
      useTeamStore.setState({ teams: remoteTeams })
    }
  }

  let isApplyingRemote = false

  async function reloadFromRemote() {
    isApplyingRemote = true
    const remoteTeams = await fetchRemoteTeams(userId)
    if (remoteTeams.length > 0) {
      useTeamStore.setState({ teams: remoteTeams })
    }
    isApplyingRemote = false
  }

  const channel = supabase
    .channel(`teams-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'teams', filter: `user_id=eq.${userId}` },
      reloadFromRemote,
    )
    .subscribe()

  let pushTimer: ReturnType<typeof setTimeout> | undefined

  const unsubscribeStore = useTeamStore.subscribe((state) => {
    if (isApplyingRemote) {
      return
    }

    clearTimeout(pushTimer)
    pushTimer = setTimeout(() => {
      state.teams.forEach((team) => {
        void pushTeam(userId, team)
      })
    }, 300)
  })

  return () => {
    clearTimeout(pushTimer)
    unsubscribeStore()
    void supabase.removeChannel(channel)
  }
}
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add cloud sync for teams and settings"
```

---

### Task 7: Wire cloud sync into the app

**Files:**
- Create: `src/app/useCloudSync.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `startFavoritesSync`, `startSearchHistorySync`, `startTeamsSync`, `startSettingsSync` (Tasks 5-6), `useAuthStore` (Task 3).
- Produces: `useCloudSync()` — call with no arguments once in `App`; no return value.

- [ ] **Step 1: Write `useCloudSync`**

```ts
import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { startFavoritesSync } from './cloudSync/syncFavorites'
import { startSearchHistorySync } from './cloudSync/syncSearchHistory'
import { startTeamsSync } from './cloudSync/syncTeams'
import { startSettingsSync } from './cloudSync/syncSettings'

export function useCloudSync() {
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      return
    }

    let cleanups: Array<() => void> = []
    let cancelled = false

    void Promise.all([
      startFavoritesSync(userId),
      startSearchHistorySync(userId),
      startTeamsSync(userId),
      startSettingsSync(userId),
    ]).then((unsubscribers) => {
      if (cancelled) {
        unsubscribers.forEach((unsubscribe) => unsubscribe())
        return
      }
      cleanups = unsubscribers
    })

    return () => {
      cancelled = true
      cleanups.forEach((unsubscribe) => unsubscribe())
    }
  }, [status, userId])
}
```

- [ ] **Step 2: Call it in `App.tsx`**

```diff
+import { useCloudSync } from './useCloudSync'
```

Inside `App()`, right after `const dialogs = useAppDialogs()`:
```ts
  useCloudSync()
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint && npm run test`
Expected: all green.

Manual test (per spec's testing section — no automated coverage for auth/Realtime):
1. `npm run dev`, sign up with a real email, confirm it, sign in.
2. Favorite a Pokémon. In Supabase dashboard's Table Editor, confirm a row appears in `favorites`.
3. Open the app in a second browser tab, signed in as the same user. Favorite a different Pokémon in tab 1 — confirm it appears in tab 2 without a manual refresh (Realtime).
4. Add a Pokémon to a team, rename the team — confirm `teams`/`team_slots` rows update in the dashboard.
5. Sign out. Confirm the app keeps working (search, favorite toggle, team edits) using only local storage.
6. Sign back in — confirm the previously-synced remote data reappears (pull-wins-on-existing-remote-row behavior).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire cloud sync into App"
```

---

## Final Verification

- [ ] Run `npm run build && npm run lint && npm run test` one final time — all green.
- [ ] Run through the 6-step manual test in Task 7 Step 3 in full.
- [ ] Run `mcp__supabase__get_advisors` with `type: "security"` one more time — no new warnings.
- [ ] Confirm the Supabase MCP server is back in `--read-only` mode (Task 2, Step 6) — this plan's work is done, no reason to keep write access enabled.
- [ ] Confirm `git log --oneline -7` shows all 6 task commits in order.
