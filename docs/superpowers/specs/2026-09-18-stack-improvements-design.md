# Archivum Arceus — Refactor Profissional (pré-Supabase)

## Contexto

Refactor grande: reorganizar arquitetura de pastas pra padrão profissional
feature-based e, em seguida, elevar a stack (React 19 + Vite + TS +
Zustand + TanStack Query + localForage/idb-keyval). A escolha de
tecnologia em si está correta pro produto — os problemas são de
organização, configuração e estilização. Supabase (auth + sync) fica
para uma fase seguinte, com spec própria.

Ordem de execução: **Fase 0 (reestruturação de pastas) primeiro,
Fase 1 (melhorias de stack) depois**, decisão explícita do usuário —
reorganizar o terreno antes de construir em cima.

## Fase 0: Reestruturação de pastas (feature-based)

Princípio: cada feature é dona de seus componentes/hooks/store; só o que
é genuinamente cross-feature vai pra `shared/`.

Estrutura hoje (camadas técnicas: `components/`, `features/`, `hooks/`,
`stores/`, `lib/`, `services/` soltos na raiz de `src/`) migra para:

```
src/
  app/                  # bootstrap: App.tsx (composição), providers.tsx, main.tsx
  features/
    pokemon/            # PokemonCard, PokemonTabs, TypeBadges, AbilityDetailsDialog
      components/       # + hooks: usePokemon, usePokemonSpecies, usePokemonSummaries,
      hooks/            #   usePokemonList, useEvolutionChain, useAbility,
                         #   useMovesDetails, usePokemonForms
    search/             # SearchExperience + searchHistoryStore + lib/search
      components/
      store/
    team/               # TeamLabView, TeamLabAnalysis, TeamSlotCard,
      components/       #   TeamPokemonEditor, AddToTeamDialog + teamStore
      store/
    favorites/          # FavoritesDrawer, FavoritesPanel, RecentPokemonPanel
      components/       #   + favoritesStore
      store/
    type-analysis/      # TeamAnalysisPanel + lib/type-chart, useTypeAnalysis
      components/       #   (consumido por pokemon e team)
      hooks/
  shared/
    ui/                 # StatusStates, layout/ (componentes genéricos sem dono)
    lib/                # utils, stats, items, hidden-power, storage (puros, sem feature dona)
    services/pokeapi/   # client, endpoints, mappers (infra compartilhada)
    stores/             # settingsStore (config global, não é de uma feature)
    types/              # pokeapi.ts, pokemon.ts, team.ts (contratos compartilhados)
```

- Mover arquivo por arquivo, ajustando imports; sem reescrever lógica
  nesta fase — é só mover/renomear, comportamento não muda.
- Cada `feature/*` ganha um `index.ts` de barrel export (já existe esse
  padrão em parte do código hoje).
- Ordem sugerida de migração (menor risco primeiro): `favorites` →
  `type-analysis` → `search` → `team` → `pokemon` → `shared`.
- Validar com `npm run build` + `npm run test` a cada feature movida.
- Mapeamento exato arquivo-a-arquivo fica pro plano de implementação
  (writing-plans), não pra esta spec.

## Fase 1: Melhorias de stack

1. TypeScript strict mode
2. PWA de verdade (vite-plugin-pwa configurado)
3. Migração completa para Tailwind CSS
4. Quebrar `App.tsx` (god component, 340 linhas) — parte já resolvida
   pela Fase 0 (componentes saem de dentro do arquivo); o que sobra é
   extrair estado de diálogos/tabs pra hooks dedicados
5. Testes de stores/hooks (gap hoje: só libs puras têm `.test.ts`)
6. Docker (build de produção)
7. CI (GitHub Actions: lint + test + build)
8. Pequenas libs de resiliência/DX: `react-error-boundary`,
   `@tanstack/react-query-devtools` (dev-only)

Fora de escopo: CSS-in-JS, troca de Zustand/TanStack Query, roteador
(2 views não justificam), monorepo, backend próprio, Supabase (fase 2).

**Nota:** `GEMINI.md` e `DESIGN.md` (que proibiam Tailwind e documentavam
o design system antigo) foram removidos a pedido do usuário — docs
desatualizados. Tailwind é a estilização oficial a partir desta fase.

## 1. TypeScript strict mode

- `tsconfig.app.json`: adicionar `"strict": true`.
- Rodar `tsc -b`, corrigir erros que aparecerem (esperado: poucos, dado uso
  já disciplinado de tipos em `types/pokeapi.ts` e `types/pokemon.ts`).
- Sem mudança de comportamento, só tipagem.

## 2. PWA

- Configurar `VitePWA` em `vite.config.ts`: `registerType: 'autoUpdate'`,
  manifest (nome, ícones a partir de `public/favicon.svg`, cores do tema
  cósmico do `DESIGN.md`), `workbox` com runtime caching:
  - PokeAPI (`pokeapi.co`) e sprites: `StaleWhileRevalidate`, já que dado
    é praticamente estático.
  - Shell da app: precache padrão do plugin.
- Sem mudança de UI.

## 3. Migração para Tailwind CSS

- Instalar `tailwindcss` + plugin do Vite (`@tailwindcss/vite`), remover
  `src/App.css` e o conteúdo custom de `src/index.css` (mantendo só
  `@import "tailwindcss"` e resets mínimos indispensáveis).
- Mapear os design tokens do `DESIGN.md` (cores cósmicas, glows, radius
  de card/control, espaçamento 4/8px) para `theme` do Tailwind
  (`tailwind.config.ts`: `colors`, `boxShadow`, `borderRadius`).
- Reescrever classes de todos os componentes em `src/features/*` e
  `src/app/App.tsx` trocando CSS custom por classes utilitárias
  Tailwind, preservando visualmente o design system atual
  (glassmorphism, glows, badges de tipo) — sem redesenhar, só re-implementar
  com Tailwind.
- Fazer por partes (regra de alterações pequenas): shell/layout primeiro,
  depois cards/badges, depois dialogs/tabs, validando build a cada etapa.

## 4. Quebrar App.tsx (resto, pós Fase 0)

- Extrair estado de diálogos/tabs para hooks dedicados
  (`useAppDialogs`, `useAppView`) em `src/app/`.
- `App.tsx` fica só composição: monta hooks, passa props pros componentes
  das features (já vivendo em `features/*` após a Fase 0). Sem mudar
  nenhuma funcionalidade (busca, favoritos, team builder, histórico
  continuam intactos).
- `teamStore.ts` (353 linhas, agora em `features/team/store/`): se ainda
  estiver inchado depois da Fase 0, considerar separar seletores/ações
  auxiliares do arquivo principal. Não normalizar/reescrever a store agora.

## 5. Testes

- Adicionar `@testing-library/react` + `@testing-library/jest-dom` +
  `jsdom` (dev deps), configurar `vitest.config` (environment: jsdom).
- Cobrir: `favoritesStore`, `teamStore` (ações principais), `searchHistoryStore`.
- Não perseguir 100% de cobertura; alvo é cobrir lógica de estado que
  hoje não tem nenhum teste.

## 6. Docker

- `Dockerfile` multi-stage: stage `build` (node, `npm ci && npm run build`),
  stage `runtime` (nginx alpine servindo `/dist`, config simples de SPA
  fallback pra `index.html`).
- Sem docker-compose nesta fase (só build de produção, não dev container).

## 7. CI

- `.github/workflows/ci.yml`: on push/PR para `dev`/`main`, roda
  `npm ci`, `npm run lint`, `npm run test`, `npm run build`.

## 8. Libs de resiliência/DX

- `react-error-boundary`: envolver a árvore principal (`App` dentro de
  `Providers`) pra evitar tela branca em erro de render; fallback simples
  com botão de retry.
- `@tanstack/react-query-devtools`: import condicional dev-only em
  `Providers.tsx` (`import.meta.env.DEV`), não entra no bundle de prod.

## Testing/validação

- Após cada item: `npm run build`, `npm run lint`, `npm run test`.
- Mudanças incrementais, um item por vez.

## Fora de escopo (fase 2)

Supabase: auth email/senha, tabela única `user_app_state` (jsonb por
usuário), sync com merge no login, localForage como cache offline. Spec
separada quando esta fase estiver concluída.
