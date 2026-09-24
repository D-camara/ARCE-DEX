# Fase 3 — Plano de implementação

> Steps em checkbox (`- [ ]`). Uma tarefa = um commit (ou poucos), sempre verde.

**Spec:** `docs/superpowers/specs/2026-09-23-fase3-hardening-design.md`

## Status: executado (2026-09-23)

Todas as tarefas foram feitas, menos a **1.9 (roteiro manual com Supabase real)**, porque o ambiente de execução não tinha as credenciais. Ela continua pendente. Decisões em aberto do spec: tema claro fica pra depois; o indicador de sync é só ícone.

Onde a execução se desviou do plano, e por quê:

- **1.5/1.6 num commit só.** A mudança de formato do histórico quebra os syncs antigos, então os dois precisavam entrar juntos.
- **1.6: `startDomainSync` compartilhado** em vez de repetir o esqueleto nos 4 domínios. Também **espera a hidratação do store** antes do primeiro merge. Sem isso, o merge de 3 vias leria o store vazio como "usuário apagou tudo" e apagaria os favoritos remotos.
- **1.6: o local é lido depois do último `await`** de cada `reconcile()`. Assim nenhuma edição do usuário no meio do sync é sobrescrita.
- **1.6 times:** depois de gravar os slots, a linha do time é "tocada" de novo. Motivo: o Realtime só observa `teams` (`team_slots` não tem `user_id`), e o outro aparelho precisa recarregar o time já completo.
- **2.3:** o Pokémon default (448) não é canonicalizado, pra URL inicial continuar limpa. A resposta da API também é gravada no cache sob o nome canônico, pra reescrever id → nome sem refazer a request.
- **3.2 tokens:** o plano dizia "corrigir os tokens pros valores usados". Não dava: `text-gold` (`#c9a646`) é usado 23× **além** do literal `#d4af37`. Mudar o token mudaria esses 23 usos. Então foram criados tokens novos com os valores exatos (`gilt`, `parchment`, ...), e unificar fica como decisão de design. O `color-mix` do modificador de opacidade foi validado pixel a pixel contra `rgba()`.
- **3.3:** só utilitários de cor simples (216) e breakpoints (106) foram migrados. Gradientes, sombras e filtros com `rgba` dentro continuam literais (efeitos pontuais) e são exceção explícita na regra de lint. O screenshot final difere do original só por 1/255 em algumas bordas semitransparentes de 1 px (arredondamento do `color-mix`).
- **3.4 Dialog:** além do planejado, uma pilha de diálogos abertos (o header fica clicável acima de um modal, então dá pra empilhar). Só o do topo reage ao Esc, e a trava de scroll é um contador. O drawer de favoritos fechado ficou `inert` (antes o Tab chegava nos botões fora da tela). Sem portal, pra não mexer em empilhamento/z-index.
- **3.5:** o levantamento não mostrou `Button`/`Panel`/`Chip` repetidos entre arquivos (as repetições eram locais). Foram extraídos o que se repete de verdade: `EmptyHint` (13×), `CloseButton` (3×) e `HeaderButton` (4×).
- **4.1:** `TeamLab` (container na feature `team`) liga o `TeamLabView` ao store. O `TeamLabView` continua componente só de props.
- **Verificação visual:** sem acesso à PokeAPI no ambiente, os screenshots usaram uma PokeAPI falsa determinística via interceptação do Playwright (44 capturas: 11 cenários × 4 larguras), comparadas pixel a pixel a cada etapa. Os scripts não foram versionados.

**Objetivo:** tornar o sync à prova de perda de dados, colocar o estado navegável na URL, trocar cores/breakpoints soltos por tokens e componentes base (sem mudar nada visualmente) e limpar o que sobrou.

## Restrições globais

- Toda tarefa termina com `npm run build && npm run lint && npm run test` limpos (dentro de `arce-dex/`).
- Deslogado, o comportamento continua idêntico ao de hoje.
- Sem CSS custom novo, só `@theme` e utilitários (regra do `AGENTS.md`).
- Lógica nova de sync/URL fica em **funções puras testadas**. Os módulos que falam com Supabase/`window` são finos.
- Nenhuma migration nova no Supabase é necessária. As colunas `updated_at`/`searched_at` já existem. (Se aparecer necessidade, parar e confirmar antes: é infra compartilhada.)

## Ordem

```
3.0 Faxina (rápida, destrava o resto)
3.1 Sync robusto          ← maior risco de perda de dados, vem primeiro
3.2 Estado na URL
3.3 Design system         ← maior diff, isolado, verificado por screenshot
3.4 Dados e App.tsx
3.5 Docs
```

As fases 3.1, 3.2 e 3.3 são independentes entre si. Dá pra paralelizar ou reordenar se preferir.

---

## 3.0 — Faxina

### Tarefa 0.1: remover código morto

**Arquivos:** `arce-dex/vite-dev.err` (apagar), `.gitignore`, `src/shared/ui/layout.ts` (apagar), `src/shared/lib/storage.ts`

- [ ] `git rm arce-dex/vite-dev.err` e adicionar `*.err` no `.gitignore`.
- [ ] Apagar `shared/ui/layout.ts` (é só `export {}`, ninguém importa).
- [ ] Em `storage.ts`, remover `storageKeys`, `readApiCacheItem`, `writeApiCacheItem`, `removeApiCacheItem` e o import de `idb-keyval` (zero usos). Remover `idb-keyval` do `package.json` via `npm uninstall idb-keyval`.
- [ ] Atualizar README (a stack cita `idb-keyval`).
- [ ] build + lint + test.

---

## 3.1 — Sync robusto

Estrutura final de `src/app/cloudSync/`:

```
cloudSync/
  merge/
    mergeSet.ts            + .test.ts   merge de 3 vias (favoritos)
    mergeLww.ts            + .test.ts   last-write-wins por chave (histórico, times, settings)
  createReconciler.ts      + .test.ts   execução serializada + debounce + gatilhos
  syncBaseline.ts                       baseline e lastSyncedUserId persistidos (localForage)
  syncStatusStore.ts                    idle | syncing | offline | error
  realtimeChannel.ts                    (já existe)
  syncFavorites.ts / syncSearchHistory.ts / syncTeams.ts / syncSettings.ts   (reescritos)
```

`decideSyncStrategy.ts` e o teste dele são apagados no fim.

### Tarefa 1.1: `mergeSet` (merge de 3 vias), puro

**Criar:** `cloudSync/merge/mergeSet.ts`, `mergeSet.test.ts`

```ts
export type SetMergeResult<T> = {
  merged: T[]      // novo estado local
  toInsert: T[]    // enviar pro remoto
  toDelete: T[]    // apagar do remoto
}

// baseline = último estado que local e remoto tinham em comum (null = nunca sincronizou)
export function mergeSet<T>(local: T[], remote: T[], baseline: T[] | null): SetMergeResult<T>
```

Regras:
- `baseline === null`: `merged = remote ∪ local`, `toInsert = local − remote`, `toDelete = []`.
- Caso contrário:
  - `addedLocal = local − baseline`
  - `removedLocal = baseline − local`
  - `merged = (remote ∪ addedLocal) − removedLocal`
  - `toInsert = addedLocal − remote`
  - `toDelete = removedLocal ∩ remote`
- Preserva ordem: itens do remoto na ordem do remoto, depois os adicionados localmente na ordem local.

Testes (um `it` por cenário):
- [ ] primeiro sync, local e remoto disjuntos → união e insere só os locais
- [ ] removido em outro aparelho (está no baseline e no local, não no remoto) → **não** ressuscita
- [ ] removido localmente (no baseline e no remoto, não no local) → `toDelete`
- [ ] adicionado localmente → `toInsert`
- [ ] adicionado nos dois lados → aparece uma vez, nada a inserir
- [ ] nada mudou → `toInsert` e `toDelete` vazios

### Tarefa 1.2: `mergeLww` (last-write-wins por chave), puro

**Criar:** `cloudSync/merge/mergeLww.ts`, `mergeLww.test.ts`

```ts
export type LwwEntry<T> = { key: string; updatedAt: string; value: T }

export function mergeLww<T>(
  local: LwwEntry<T>[],
  remote: LwwEntry<T>[],
): { merged: LwwEntry<T>[]; toUpsert: LwwEntry<T>[] }
```

- Por chave, vence o `updatedAt` maior. Empate → remoto (evita reenvio infinito).
- `toUpsert` = entradas locais que venceram (ou não existem no remoto).
- `updatedAt` ausente/inválido conta como época zero.

Testes:
- [ ] local mais novo → vai pro `toUpsert`
- [ ] remoto mais novo → vence e não reenvia
- [ ] empate → remoto
- [ ] chave só local → upsert
- [ ] chave só remota → entra no merged
- [ ] timestamp inválido → tratado como mais antigo

### Tarefa 1.3: `createReconciler`, puro com timers fakes

**Criar:** `cloudSync/createReconciler.ts`, `.test.ts`

```ts
export function createReconciler(run: () => Promise<void>, options?: { debounceMs?: number }): {
  request: () => void        // debounced: mudanças do store local
  requestNow: () => void     // imediato: start, realtime, online, visibility
  dispose: () => void
}
```

- Nunca executa `run` em paralelo. Pedido durante execução marca `dirty` e roda **uma** vez no fim.
- Erro em `run` não quebra o reconciler (loga e segue). O próximo pedido tenta de novo.
- Testes com `vi.useFakeTimers()`:
  - [ ] 5 `request()` em 100 ms → 1 execução
  - [ ] `requestNow()` durante execução → exatamente 1 execução extra
  - [ ] `run` rejeitado → próximo pedido executa
  - [ ] `dispose()` cancela timer pendente

### Tarefa 1.4: baseline e dono dos dados

**Criar:** `cloudSync/syncBaseline.ts`

- `readBaseline<T>(userId, domain): Promise<T | null>` / `writeBaseline(userId, domain, value)`. Chave: `arce-dex:sync-baseline:<userId>:<domain>` via `readStorageItem`/`writeStorageItem`.
- `readLastSyncedUserId()` / `writeLastSyncedUserId(userId)`.
- `resolveOwnership(lastSyncedUserId, userId): 'anonymous-data' | 'same-user' | 'other-user'` é **puro, com teste**.

Regra aplicada em cada domínio no **primeiro** reconcile da sessão:
- `other-user` → baseline tratado como "remoto é tudo". Merged = remoto e nada é enviado. Na prática: chamar merge com `local = remote`.
- `anonymous-data` / `same-user` → merge normal.
- Após o primeiro reconcile bem-sucedido de todos os domínios → `writeLastSyncedUserId(userId)`.

### Tarefa 1.5: timestamps nos stores (com migração do persist)

**Modificar:** `features/search/store/searchHistoryStore.ts` (+ teste), `features/team/store/teamStore.ts` (+ teste), `shared/types/team.ts`, `shared/stores/settingsStore.ts`, consumidores do histórico.

- [ ] **Histórico:** `history: string[]` → `history: { term: string; searchedAt: string }[]`. `persist` com `version: 1` e `migrate` convertendo array de string (`searchedAt` = agora − índice em ms, pra manter a ordem). Exportar seletor `selectHistoryTerms` e ajustar `useDexPageData`/`appDataAdapters` pra usá-lo. Teste da migração.
- [ ] **Times:** `Team.updatedAt?: string`. Toda action que muda um time seta `updatedAt = new Date().toISOString()` **só no time alterado**. Normalização de dado antigo: sem `updatedAt` continua válido. Teste: `renameTeam` muda só o `updatedAt` do time alvo.
- [ ] **Settings:** `updatedAt?: string`, setado em `setTheme`.
- [ ] build + lint + test.

### Tarefa 1.6: `syncStatusStore` + reescrita dos 4 syncs

**Criar:** `cloudSync/syncStatusStore.ts` (zustand sem persist). **Reescrever:** os 4 `sync*.ts`.

Esqueleto comum (favoritos como exemplo):

```ts
export async function startFavoritesSync(userId: string, ownership: Ownership) {
  if (!supabase) return () => {}
  const client = supabase
  let lastApplied: number[] | null = null

  async function run() {
    const { data, error } = await client.from('favorites').select('pokemon_id').eq('user_id', userId)
    if (error) throw error
    const remote = data.map((row) => row.pokemon_id as number)
    const local = useFavoritesStore.getState().favoritePokemonIds
    const baseline = ownership === 'other-user' ? remote : await readBaseline<number[]>(userId, 'favorites')
    const { merged, toInsert, toDelete } = mergeSet(
      ownership === 'other-user' ? remote : local, remote, baseline,
    )
    ownership = 'same-user' // só o primeiro run respeita other-user

    lastApplied = merged
    useFavoritesStore.setState({ favoritePokemonIds: merged })   // síncrono → sem race

    const results = await Promise.all([
      toInsert.length ? client.from('favorites').insert(toInsert.map(...)) : ok,
      toDelete.length ? client.from('favorites').delete().eq('user_id', userId).in('pokemon_id', toDelete) : ok,
    ])
    const failed = results.find((result) => result.error)
    if (failed) throw failed.error                    // baseline NÃO avança → retry no próximo run
    await writeBaseline(userId, 'favorites', merged)
  }

  const reconciler = createReconciler(withSyncStatus(run))
  const unsubscribeStore = useFavoritesStore.subscribe((state) => {
    if (state.favoritePokemonIds !== lastApplied) reconciler.request()
  })
  const channel = await subscribeToTableChanges(client, `favorites-${userId}`, 'favorites', userId, reconciler.requestNow)
  reconciler.requestNow()
  return () => { reconciler.dispose(); unsubscribeStore(); void client.removeChannel(channel) }
}
```

- [ ] `withSyncStatus(run)`: seta `syncing`. No fim, `idle`. Em erro: `offline` se `!navigator.onLine`, senão `error`.
- [ ] **Favoritos:** `mergeSet` + baseline.
- [ ] **Histórico:** `mergeLww` com `key = term`. Depois do merge, ordenar por `searchedAt` desc, cortar em 20 e **apagar do remoto** os termos além do top 20 (hoje a tabela cresce sem limite).
- [ ] **Times:** `mergeLww` com `key = team.id`, `updatedAt` do time. Enviar **só** os times em `toUpsert` (hoje manda os 6 sempre). `pushTeam` passa a retornar/propagar erro.
- [ ] **Settings:** `mergeLww` com uma chave só.
- [ ] Nenhum `void ...then()` sobra. Toda chamada checa `error`.

### Tarefa 1.7: gatilhos globais + orquestração em `useCloudSync`

**Modificar:** `app/useCloudSync.ts`

- [ ] Antes de iniciar: `ownership = resolveOwnership(await readLastSyncedUserId(), userId)` e passar pros 4 `start*Sync`.
- [ ] Depois que os 4 iniciarem sem erro: `writeLastSyncedUserId(userId)`.
- [ ] `window` `online` e `document` `visibilitychange` (visível) → `requestNow()` em todos. Expor `requestNow` no retorno de cada `start*Sync` (objeto `{ stop, requestNow }`).
- [ ] Cleanup remove os listeners.

### Tarefa 1.8: indicador de sync no header

**Criar:** `app/SyncStatusIndicator.tsx` + teste. **Modificar:** `App.tsx`.

- [ ] Só renderiza quando `authStatus === 'authenticated'`. Ícones lucide: `Cloud` (idle), `RefreshCw` animado (syncing), `CloudOff` (offline), `AlertTriangle` (error), com `title`/`aria-label` em PT.
- [ ] Teste com Testing Library: para cada status do store, o label certo.

### Tarefa 1.9: limpeza e verificação manual

- [ ] Apagar `decideSyncStrategy.ts` e `decideSyncStrategy.test.ts`.
- [ ] Roteiro manual (2 abas ou 2 navegadores, mesma conta):
  1. Deslogado: favoritar 3. Logar numa conta com 2 favoritos diferentes → ficam 5 (antes: 2).
  2. Aba A remove um favorito. Aba B recebe. Fechar B, reabrir → **não** ressuscita.
  3. DevTools offline na aba A: favoritar e renomear time. Indicador fica `offline`. Voltar online → sobe sozinho, B recebe.
  4. Logout de A, login com conta B no mesmo navegador → os favoritos de A **não** vão pra conta B.
  5. Editar times rápido (5 mudanças em 1 s) → aba Network mostra 1 upsert do time alterado, não 6.
- [ ] build + lint + test.

---

## 3.2 — Estado na URL

### Tarefa 2.1: parse/serialize, puro

**Criar:** `app/urlState.ts`, `urlState.test.ts`

```ts
export type UrlState = {
  view: 'dex' | 'team-lab'
  pokemon: string | number    // default 448
  tab: PokemonTabName         // default 'Info'
}
export function parseUrlState(search: string): UrlState
export function serializeUrlState(state: UrlState): string   // omite valores default → URL limpa
```

- Slugs: `view=team` ↔ `'team-lab'`. `tab` em minúsculo ↔ `PokemonTabName`. `pokemon` numérico vira `number`, texto passa por `normalizePokemonSearch`.
- Valor inválido cai no default e não quebra.
- Testes: ida e volta (`parse(serialize(x)) == x`), defaults omitidos, lixo na URL, `?pokemon=445` vira número.

### Tarefa 2.2: `useUrlState` e integração com `useAppView`

**Criar:** `app/useUrlState.ts` + teste (jsdom). **Modificar:** `app/useAppView.ts`.

- [ ] Estado inicial vindo de `parseUrlState(location.search)`.
- [ ] Setters: `setSelectedIdentifier` e `setActiveView` → `pushState`. `setActivePokemonTab` → `replaceState`. Não escrever se a URL já for igual.
- [ ] Listener de `popstate` reaplica o estado. Remove no unmount.
- [ ] A API pública de `useAppView` **não muda**, então `useDexActions`/`App.tsx` não mexem.
- [ ] Teste: mudar Pokémon → `history.length` cresce; `history.back()` + `popstate` → volta o anterior; mudar aba não cresce o histórico.

### Tarefa 2.3: canonicalizar e título

**Modificar:** `app/useDexPageData.ts` ou um `useEffect` em `App.tsx`.

- [ ] Quando `selectedPokemon` carrega e o identificador da URL difere de `selectedPokemon.name` → `replaceState` com o nome.
- [ ] `document.title = \`${displayName} · Archivum Arceus\`` (e só o nome do app na view de times).
- [ ] Verificar manualmente: abrir `/?pokemon=445&tab=moves` direto, F5, botão voltar do Android (Chrome DevTools, modo dispositivo), link colado em aba anônima.

---

## 3.3 — Design system (sem mudança visual)

### Tarefa 3.1: baseline visual

- [ ] Script Playwright (fora do repo, no scratchpad, ou `arce-dex/scripts/visual-snapshot.mjs` se quisermos manter) que sobe `npm run preview` e tira screenshot de: dex (Pokémon 448, abas Info e Moves), team lab, cada diálogo aberto. Larguras 280, 375, 760 e 1280.
- [ ] Salvar como "antes". Toda tarefa desta fase compara contra ele (`pixelmatch` ou comparação do Playwright, tolerância 0).

### Tarefa 3.2: tokens reais no `@theme`

**Modificar:** `src/index.css`

- [ ] Levantar a paleta efetiva: `grep -rhoE '(bg|text|border|from|to|via|shadow|ring|outline)-\[(#|rgba)[^]]*\]' src | sort | uniq -c`. Agrupar por cor base, ignorando o alfa.
- [ ] Corrigir/adicionar tokens com a cor **sólida** usada: `--color-gold: rgb(212 175 55)`, `--color-ivory: rgb(246 237 211)`, `--color-panel: rgb(18 22 32)`, `--color-ink: rgb(9 11 16)`, `--color-slate-deep: rgb(2 6 23)`, `--color-sky: rgb(56 189 248)`, e os tons de texto (`#fecdd3`, `#e0f2fe`, `#bbf7d0`, `#bae6fd`...), com nomes semânticos quando o uso for semântico (`--color-danger-soft`, `--color-success-soft`).
- [ ] Os tokens antigos que ninguém usa saem. Os usados que mudariam de valor ficam como estão até a migração provar que não mudou nada.
- [ ] Breakpoints: `--breakpoint-fold: 280px; --breakpoint-xs: 375px; --breakpoint-phone: 400px; --breakpoint-sm: 600px; --breakpoint-md: 760px; --breakpoint-lg: 1024px`. `md`/`sm` sobrescrevem os defaults do Tailwind (768/640). Ninguém usa os defaults hoje, então conferir com `grep -rn ' sm:\| md:' src` antes.

### Tarefa 3.3: migração mecânica das classes

- [ ] Tabela de substituição (`rgba(R,G,B,A)` → `token/NN`, com `NN = A*100`; `max-[760px]` → `max-md` etc.). Aplicar com script `sed`/node, **um arquivo por vez**, comparando screenshot.
- [ ] Alfas quebrados (ex.: `0.64`) viram `/64`. O Tailwind v4 aceita qualquer inteiro.
- [ ] Gradientes e sombras com `rgba` dentro de `[...]`: usar `var(--color-x)` com `color-mix` só se o utilitário não cobrir. Caso contrário, deixar e anotar como exceção.
- [ ] Meta: zero `[rgba(` e `[#` em `className`. Exceções listadas num comentário no `eslint.config.js`.

### Tarefa 3.4: `Dialog` base

**Criar:** `shared/ui/Dialog.tsx`, `Dialog.test.tsx`. Exportar em `shared/ui/index.ts`.

```tsx
type DialogProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  title: string                        // vira aria-labelledby
  variant?: 'modal' | 'drawer'         // FavoritesDrawer usa 'drawer'
  className?: string                   // largura/padding específicos
}>
```

- Overlay com clique fora fecha. `Esc` fecha. `role="dialog"` + `aria-modal` + `aria-labelledby`. Foca o primeiro elemento focável ao abrir e devolve o foco ao fechar. `overflow-hidden` no body enquanto aberto. Renderiza via `createPortal`.
- [ ] Testes: Esc chama `onClose`. Clique no overlay chama e clique no conteúdo não. `role`/nome acessível. Foco volta pro botão que abriu.
- [ ] Migrar, um por commit, com screenshot: `AbilityDetailsDialog`, `AddToTeamDialog`, `FavoritesDrawer`, `AuthForm`. O `AuthForm.test.tsx` existente tem que continuar passando.

### Tarefa 3.5: `Button`, `Panel`, `Chip`

- [ ] Encontrar as strings de classe repetidas (≥3 ocorrências) depois da 3.3. Só extrair o que se repete. Não criar abstração especulativa.
- [ ] `Button` com `variant: 'primary' | 'ghost' | 'danger' | 'icon'`, repassando `...props` do `<button>`. `Panel` pro card de superfície (borda + fundo + raio). `Chip` pros badges/pílulas.
- [ ] Migrar usos. Screenshot igual.

### Tarefa 3.6: guarda no ESLint

**Modificar:** `eslint.config.js`

- [ ] `no-restricted-syntax` com seletores pra `JSXAttribute[name.name='className']` contendo `Literal`/`TemplateElement` com `/\[(rgba|#)/`. Mensagem: "Use um token do @theme (ex.: bg-gold/10) em vez de cor literal".
- [ ] `npm run lint` limpo. Testar que acusa colocando uma cor literal de propósito.

---

## 3.4 — Dados e `App.tsx`

### Tarefa 4.1: `useDexActions` lê os stores sozinho

**Modificar:** `app/useDexActions.ts`, `app/App.tsx`

- [ ] Remover `teams`, `activeTeamId`, `addPokemonToTeam`, `toggleFavorite`, `isFavorite` e `addSearch` dos parâmetros. Dentro dos handlers usar `useTeamStore.getState()` etc. (handler não precisa re-renderizar).
- [ ] `App.tsx` mantém só os seletores que **renderizam** algo (`teams`/`activeTeamId` pro `TeamLabView`/`AddToTeamDialog`). Idealmente esses componentes passam a ler o store eles mesmos, via barrel da feature.
- [ ] Comportamento idêntico. Os testes existentes passam.

### Tarefa 4.2: cache da PokeAPI

**Modificar:** `app/providers.tsx`, `features/pokemon/hooks/*`, `vite.config.ts`

- [ ] `QueryClient` default: `staleTime: Infinity`, `gcTime: 24h`. Remover os `staleTime` por hook (`useAbility`, `useMovesDetails`, `usePokemonSummaries`).
- [ ] Workbox: `expiration: { maxEntries: 500, maxAgeSeconds: 30 dias }` no cache da API e `{ maxEntries: 1500, maxAgeSeconds: 90 dias }` nos sprites. `cacheableResponse: { statuses: [0, 200] }` nos sprites (resposta opaca).

### Tarefa 4.3: buscar resumos de favoritos só quando precisa

**Modificar:** `app/useDexPageData.ts`

- [ ] Separar `relatedSummaryQuery` em duas: histórico + formas (sempre) e favoritos (`enabled` só com `dialogs.isFavoritesOpen`). Precisa aceitar `enabled` em `usePokemonSummaries`.
- [ ] Conferir no Network: abrir o app com 30 favoritos → nenhuma request de favorito até abrir o drawer.

### Tarefa 4.4: decisão do tema

- [ ] Aplicar o que for decidido no spec ("Decisões em aberto"). Default recomendado: **não mexer** agora e abrir item no "O que falta" do `AGENTS.md`.

---

## 3.5 — Documentação

- [ ] `AGENTS.md`: adicionar Fase 3 no histórico. Atualizar a seção de sync (reconcile, estratégias por domínio, baseline). Convenções novas: tokens obrigatórios (lint), `shared/ui/Dialog` pra qualquer modal, estado navegável via `useUrlState`.
- [ ] `README.md`: tirar `idb-keyval` e citar links compartilháveis.
