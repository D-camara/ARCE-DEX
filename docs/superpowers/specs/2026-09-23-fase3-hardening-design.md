# Fase 3 — Sync robusto, estado na URL, design system e limpeza (Design)

## Contexto

Depois das Fases 0–2 o app tem arquitetura boa (feature-based com fronteira checada por lint, offline-first, Supabase com RLS). Uma revisão geral levantou quatro frentes de melhoria, em ordem de impacto:

1. **Sync pode perder dados.** A regra "remoto vazio → push, senão → remoto sobrescreve local" descarta o que o usuário fez offline/deslogado quando a conta já tem dados. Escritas são fire-and-forget (`void ...then()`, erro ignorado) e nunca são reenviadas. Existe uma race na flag `isApplyingRemote`, que fica `true` durante um `await`, então edição local nessa janela não sobe. O sync de times reenvia os 6 times a cada mudança.
2. **Nada vive na URL.** View, Pokémon selecionado e aba ficam em `useState`. Não dá pra compartilhar link, o "voltar" do celular sai do app e F5 volta sempre pro Pokémon 448.
3. **Estilo difícil de manter.** São 133 cores literais (`rgba(...)`/`#hex`) em `.tsx` e 7 breakpoints arbitrários (`max-[375px]`, `min-[760px]`...). Os tokens do `@theme` existem mas **não batem** com as cores usadas: o componente usa `rgba(212,175,55,…)` como dourado, e o token `--color-gold` é `#c9a646` (201,166,70). O mesmo vale pro marfim `246,237,211` vs `255,246,216`. São 4 diálogos implementados à mão, cada um com overlay próprio e só 2 com `role="dialog"`. Nenhum fecha com Esc.
4. **Menores.** `App.tsx` repassa ~10 seletores de store. Há código morto (`shared/ui/layout.ts` vazio, helpers de API cache e `storageKeys` em `storage.ts` sem uso, `vite-dev.err` versionado). O `theme` do `settingsStore` é sincronizado mas nenhum componente lê. O cache do Workbox pra PokeAPI não tem expiração (cresce sem limite). Os resumos de favoritos são buscados sempre, mesmo com o drawer fechado.

## Decisões

### 1. Sync: reconciliação em vez de "quem ganha"

- **Um único caminho de escrita: `reconcile()`.** Cada domínio tem uma função `reconcile()` que (a) lê o remoto, (b) faz merge com o local, (c) grava o resultado no store, (d) envia a diferença pro Supabase. Ela é disparada por: início do sync, mudança no store local (debounce 300 ms), evento Realtime, evento `online` do browser e `visibilitychange` → visível.
- **Retry "de graça".** O estado "já sincronizado" só avança quando todas as escritas retornam sem erro. Se uma escrita falha, a próxima `reconcile()` recalcula a mesma diferença e tenta de novo. Não precisa de outbox/fila persistida.
- **Execução serializada.** Se `reconcile()` for chamada enquanto roda, marca "sujo" e roda mais uma vez no fim. Nunca roda duas em paralelo. Isso elimina a flag `isApplyingRemote` e a race.
- **Estratégia de merge por domínio:**

  | Domínio | Estratégia | Por quê |
  |---|---|---|
  | Favoritos | **merge de 3 vias** com baseline (último estado sincronizado, persistido por usuário) | é um conjunto com remoção. União simples ressuscitaria favorito removido em outro aparelho |
  | Histórico | **last-write-wins por termo** (`searchedAt`), top 20 | ordem importa. Não existe remoção de item na UI |
  | Times | **last-write-wins por time** (`updatedAt`) | são sempre 6 times fixos (sem criar/apagar), o time inteiro é a unidade de edição |
  | Settings | **last-write-wins** (`updatedAt`) | uma linha só |

- **Troca de conta no mesmo aparelho.** Persistir `lastSyncedUserId`. Três casos:
  - Dado local nunca sincronizado (`null`): faz merge (sobe o trabalho feito deslogado).
  - Dado local pertence a **outro** usuário: remoto vence, sem subir nada. Evita vazar os favoritos de A pra conta de B.
  - Mesmo usuário: merge normal.
- **Relógio.** LWW compara timestamps gerados no cliente. Diferença de relógio entre aparelhos pode fazer uma edição concorrente "perder". Isso é aceitável pra este app (um usuário, edições raras em paralelo) e fica documentado.
- **Status visível.** Um `syncStatusStore` (`idle | syncing | offline | error`) aparece como indicador discreto no header, só quando logado.

### 2. URL: query string, sem lib de roteamento

- `?pokemon=garchomp&tab=moves&view=team`. Só estado **navegável** vai pra URL. `query` da busca, autocomplete aberto e diálogos continuam em `useState`.
- Hook próprio (`app/useUrlState.ts`) com `URLSearchParams` + `history.pushState`/`popstate`. Funções puras de parse/serialize testadas.
- Trocar Pokémon ou view faz `pushState` (entra no histórico, o "voltar" funciona). Trocar aba faz `replaceState` (não polui o histórico).
- **Por que não React Router / TanStack Router:** o app tem 2 views e 1 entidade selecionável. Uma lib de rota traria reestruturação da árvore sem ganho proporcional. Query string também não exige rewrite na Vercel (`/pokemon/garchomp` exigiria). Se um dia houver mais telas, migrar pra TanStack Router é direto porque o estado já estará centralizado num hook só.
- Depois de carregar, a URL é canonicalizada pro nome (`?pokemon=445` → `?pokemon=garchomp`) com `replaceState`, e `document.title` passa a ser `"Garchomp · Archivum Arceus"`.

### 3. Design system mínimo, sem mudança visual

- **Regra de ouro: pixel-idêntico.** Screenshots com Playwright antes e depois, em 280/375/760/1280 px de largura, nas duas views. Qualquer diferença é bug.
- **Tokens refletem o que está em uso**, não o contrário. O `@theme` é corrigido pros valores que os componentes realmente pintam (dourado `212 175 55`, marfim `246 237 211`, painel `18 22 32`, céu `56 189 248`, ardósia `2 6 23`...). Transparências viram modificador de opacidade do Tailwind v4 (`border-ivory/12`, `bg-gold/10`).
- **Breakpoints nomeados** em `@theme` (`--breakpoint-*`): `fold` 280, `xs` 375, `phone` 400, `sm` 600, `md` 760, `lg` 1024. `max-[399px]` vira `max-phone` (diferença de 1 px, validada no screenshot).
- **Componentes base em `shared/ui`:** `Dialog` (overlay, Esc, clique fora, `role`/`aria-modal`/`aria-labelledby`, trava scroll do body, foco inicial e devolução de foco), `Button` (variantes), `Panel` e `Chip`. Só extrai o que se repete de verdade (≥3 usos).
- **Guarda no lint**, no mesmo espírito da regra de imports: `no-restricted-syntax` proíbe `[rgba(` e `[#` em `className`. Entra como `error` depois da migração.

### 4. Limpeza e dados

- `useDexActions` passa a ler os stores direto (`useXStore.getState()` dentro dos handlers). O `App.tsx` para de repassar seletores.
- Dados da PokeAPI são praticamente imutáveis. `staleTime: Infinity` vira default do `QueryClient` e os overrides por hook saem.
- O Workbox ganha `expiration` (`maxEntries`/`maxAgeSeconds`) nos dois caches.
- Resumos de favoritos só são buscados com o drawer aberto.
- Remove código morto e `vite-dev.err` (`*.err` vai pro `.gitignore`).
- **Não entra:** `persistQueryClient`. O Service Worker já cacheia as respostas da PokeAPI (StaleWhileRevalidate), então o ganho seria pequeno pra mais uma dependência.

## Decisões em aberto (confirmar antes da tarefa correspondente)

- **Tema claro.** Hoje `theme` sincroniza mas não faz nada. Recomendação: manter a infra e implementar o tema claro **depois** da 3.3 (com tokens, vira "redefinir variáveis"). Alternativa: remover `theme` do store/sync até existir.
- **Indicador de sync.** Recomendação: só ícone (nuvem ok / nuvem riscada / alerta) com `title`. Alternativa: texto.

## Fora do escopo

Reset de senha, OAuth, tombstones/CRDT, edição colaborativa em tempo real, SSR/meta tags de compartilhamento (SPA não entrega OG por Pokémon sem servidor).
