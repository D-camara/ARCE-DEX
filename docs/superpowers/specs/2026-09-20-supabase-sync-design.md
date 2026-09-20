# Fase 2 — Supabase: Auth + Sync (Design)

## Contexto

Hoje (pós Fase 0/1) o app é 100% client-side: Zustand + `persist` grava em localForage, sem conta de usuário, sem sync entre dispositivos. O produto vai deixar de ser só para os dois desenvolvedores testarem — a expectativa é ter usuários reais criando conta para salvar times e, no futuro, outros tipos de dado. Esta fase adiciona Supabase como backend de auth + sincronização, mantendo o app funcional offline/deslogado exatamente como hoje.

Supabase já está configurado: projeto criado (`dddjlzixsseacqdrepfq`), Data API + RLS automático ligados, integração GitHub (`working directory: arce-dex`, branch de produção `main`, deploy automático em push), integração Vercel (env vars sincronizadas, só `Production`), MCP server do Supabase conectado (modo `--read-only` até a implementação começar).

## Decisões

- **Login**: email/senha via Supabase Auth. **Confirmação de email obrigatória** (usuários reais, evita cadastro com email inválido).
- **O que sincroniza**: favoritos, times, histórico de busca, **e** configurações (`settingsStore`) — tudo que hoje é persistido local.
- **Sync em tempo real**: Supabase Realtime (`postgres_changes`), não só no login/save. Justificativa do usuário: preparar para múltiplos usuários reais e dados futuros; mesmo sem edição colaborativa hoje, quer a infraestrutura pronta.
- **Merge no primeiro login**: sem merge campo-a-campo. Regra simples:
  - Não existe linha remota para o `user_id` → sobe o estado local inteiro (é a primeira vez que esse usuário sincroniza).
  - Já existe linha remota → remoto é fonte da verdade, sobrescreve o local.
  - Deslogado → comportamento atual inalterado (100% local via localForage).
- **Schema**: tabelas normalizadas por domínio (não um blob JSON único), pensando em crescimento futuro (mais tipos de dado sem re-migrar tudo).

## Arquitetura

```
src/
  shared/
    services/
      supabase/
        client.ts          # cliente Supabase singleton (lê VITE_SUPABASE_URL/ANON_KEY)
  features/
    auth/                  # feature nova
      components/          # formulário login/cadastro, aviso de confirmação de email
      store/
        authStore.ts        # sessão via supabase.auth.onAuthStateChange (zustand, sem persist)
      index.ts
  app/
    useCloudSync.ts         # hook novo, montado uma vez em App/Providers
```

`useCloudSync()` é o único ponto que conhece Supabase fora de `features/auth` e `shared/services/supabase`. As stores existentes (`favoritesStore`, `teamStore`, `searchHistoryStore`, `settingsStore`) **não mudam sua lógica interna** — continuam `create(persist(...))` com localForage. O hook:

1. Observa `authStore` (logado/deslogado).
2. Ao logar: para cada uma das 4 stores, roda o merge (seção abaixo), depois assina `postgres_changes` filtrado por `user_id=eq.<uid>` na tabela correspondente e aplica updates remotos no estado da store via `.setState(...)`.
3. Assina cada store com `store.subscribe(...)`: toda mudança local (enquanto logado) dispara um `upsert` na tabela do Supabase.
4. Ao deslogar: cancela as subscriptions Realtime. Store local continua com o último estado sincronizado (agora comportando-se como cache offline).

Isso isola sync como uma camada — se o Supabase cair, o app continua funcionando local (só para de sincronizar).

## Schema

```sql
-- favoritos: um usuário, N pokémon favoritados
create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  pokemon_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, pokemon_id)
);

-- times: 1 linha por time (até 6 por usuário, espelhando MAX_TEAMS do client)
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_team_id text not null, -- 'team-1'..'team-6', vem do client
  name text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, client_team_id)
);

-- slots de cada time: 6 por time, pokemon guardado como jsonb
-- (TeamPokemon tem muitos campos opcionais — nature, evs, ivs, moves, item,
-- role, notes — normalizar em colunas seria over-engineering agora)
create table public.team_slots (
  team_id uuid not null references public.teams(id) on delete cascade,
  slot_index integer not null check (slot_index >= 0 and slot_index < 6),
  pokemon jsonb,
  updated_at timestamptz not null default now(),
  primary key (team_id, slot_index)
);

-- histórico de busca: linhas simples, cliente mantém só as 20 mais recentes
create table public.search_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  searched_at timestamptz not null default now(),
  primary key (user_id, term)
);

-- configurações: 1 linha por usuário
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system',
  updated_at timestamptz not null default now()
);
```

Sem tabela `profiles` — `auth.users` já cobre o necessário nesta fase.

### RLS

Todas as 5 tabelas: RLS ligado (automático, já configurado no projeto), com política idêntica em cada uma:

```sql
alter table public.favorites enable row level security;
create policy "own rows only" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- team_slots não tem user_id direto: política via join com teams
alter table public.team_slots enable row level security;
create policy "own rows only" on public.team_slots
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  );

-- (mesma política "auth.uid() = user_id" para teams, search_history, settings)
```

### Realtime

Habilitar replication nas 5 tabelas (necessário para `postgres_changes`):

```sql
alter publication supabase_realtime add table
  public.favorites, public.teams, public.team_slots, public.search_history, public.settings;
```

## Auth

- `supabase.auth.signUp({ email, password })` — Supabase manda o email de confirmação sozinho (configuração padrão do projeto, nada a fazer no código além de ligar "Confirm email" nas configs de Auth do dashboard).
- `supabase.auth.signInWithPassword({ email, password })`.
- `supabase.auth.signOut()`.
- `authStore` (zustand, **sem** `persist` — a sessão já persiste via `supabase-js` internamente em localStorage) escuta `supabase.auth.onAuthStateChange` e expõe `{ session, user, status: 'loading' | 'authenticated' | 'anonymous' }`.
- UI mínima: formulário de login/cadastro (`features/auth/components/AuthForm.tsx`), acessível a partir do topbar (ex: um botão "Entrar" ao lado de Favoritos/Meu Time). Usuário deslogado usa o app inteiro normalmente, só sem sync.

## Sync — mecânica por store

Para cada store, o hook faz, na ordem:

1. **Pull**: `select * from <tabela> where user_id = auth.uid()`.
2. **Decisão de merge**:
   - Resultado vazio → **push**: insere no Supabase o estado atual da store local.
   - Resultado não-vazio → **pull vence**: `store.setState(mapeamento-do-remoto)`, sobrescrevendo o local.
3. **Subscribe realtime**: canal Supabase filtrado por `user_id=eq.<uid>` (ou, para `team_slots`, por `team_id in (select id from teams where user_id = ...)` — como Realtime filtra só por igualdade simples, a alternativa prática é assinar em `teams` e, ao detectar mudança, re-fazer o pull de `team_slots` daquele `team_id`).
4. **Push local→remoto**: a forma depende do formato da tabela.
   - **`favorites`** (multi-linha, uma por Pokémon): não é upsert de blob — `toggleFavorite` liga direto na ação: favoritou → `insert`, desfavoritou → `delete` da linha `(user_id, pokemon_id)`.
   - **`search_history`** (multi-linha, uma por termo): `addSearch` → `upsert` da linha `(user_id, term)` com `searched_at = now()`; a store local já cuida do cap de 20 e da ordenação, então o remoto só espelha inserções (sem replicar poda por tamanho — poda é cosmética, não crítica).
   - **`teams` / `team_slots` / `settings`** (entidade única por usuário/time): aqui sim é `store.subscribe((state) => upsert(...))` do registro inteiro, com debounce simples (300ms) para não disparar um upsert por tecla digitada (ex: campo de notes do time).

## Erros e offline

- Sem internet ou Supabase fora do ar: pull/subscribe falham silenciosamente (log de erro no console, não trava a UI), app continua funcionando 100% local via localForage, exatamente como hoje.
- Escrita que falha (upsert): não implementamos fila de retry nesta fase (YAGNI) — próxima mudança local tenta de novo. Documentar como limitação conhecida.
- Erro de autenticação (senha errada, email não confirmado): mensagem de erro simples no formulário, sem retry automático.

## Testes

- Lógica pura de decisão de merge (`resultado vazio → push, senão → pull vence`) é testável isoladamente com Vitest, sem mockar Supabase de verdade — extrair como função pura `decideSyncStrategy(remoteRows: unknown[]): 'push' | 'pull'`.
- Autenticação e Realtime não são testados automaticamente nesta fase (exigiriam mock pesado de WebSocket) — plano de teste manual: cadastro, confirmação de email, login em 2 abas, favoritar em uma e ver refletir na outra, deslogar e confirmar que o app continua funcionando local.

## Fora de escopo

- Reset de senha (fica para depois — Supabase Auth já suporta nativamente quando for hora).
- OAuth (Google, etc.) — só email/senha por agora.
- Fila de retry para escritas offline.
- Dados compartilhados entre usuários diferentes (times públicos, ranking) — esta fase é só sync pessoal entre os próprios dispositivos do usuário.
