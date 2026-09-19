# Archivum Arceus — Stack Improvements (Fase 1, pré-Supabase)

## Contexto

Revisão da stack atual (React 19 + Vite + TS + Zustand + TanStack Query +
localForage/idb-keyval, CSS puro, sem Tailwind). Stack em si está correta
para o produto; os problemas são de configuração e organização, não de
escolha de tecnologia. Supabase (auth + sync) fica para uma fase seguinte,
com spec própria.

## Escopo desta fase

1. TypeScript strict mode
2. PWA de verdade (vite-plugin-pwa configurado)
3. Quebrar `App.tsx` (god component, 340 linhas)
4. Testes de stores/hooks (gap hoje: só libs puras têm `.test.ts`)
5. Docker (build de produção)
6. CI (GitHub Actions: lint + test + build)
7. Pequenas libs de resiliência/DX: `react-error-boundary`,
   `@tanstack/react-query-devtools` (dev-only)

Fora de escopo: Tailwind/CSS-in-JS (proibido), troca de Zustand/TanStack
Query, roteador (2 views não justificam), Supabase (fase 2).

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

## 3. Quebrar App.tsx

- Extrair estado de diálogos/tabs para hooks dedicados
  (`useAppDialogs`, `useAppView`) em `src/app/`.
- `App.tsx` fica só composição: monta hooks, passa props pros componentes
  já existentes (`SearchExperience`, `TeamLabView`, dialogs). Sem mudar
  nenhuma funcionalidade (busca, favoritos, team builder, histórico
  continuam intactos, conforme regra do `GEMINI.md`).
- `teamStore.ts` (353 linhas): revisar depois de separar `App.tsx`; se
  ainda estiver inchado, considerar separar seletores/ações auxiliares
  do arquivo principal da store. Não normalizar/reescrever a store agora.

## 4. Testes

- Adicionar `@testing-library/react` + `@testing-library/jest-dom` +
  `jsdom` (dev deps), configurar `vitest.config` (environment: jsdom).
- Cobrir: `favoritesStore`, `teamStore` (ações principais), `searchHistoryStore`.
- Não perseguir 100% de cobertura; alvo é cobrir lógica de estado que
  hoje não tem nenhum teste.

## 5. Docker

- `Dockerfile` multi-stage: stage `build` (node, `npm ci && npm run build`),
  stage `runtime` (nginx alpine servindo `/dist`, config simples de SPA
  fallback pra `index.html`).
- Sem docker-compose nesta fase (só build de produção, não dev container).

## 6. CI

- `.github/workflows/ci.yml`: on push/PR para `dev`/`main`, roda
  `npm ci`, `npm run lint`, `npm run test`, `npm run build`.

## 7. Libs de resiliência/DX

- `react-error-boundary`: envolver a árvore principal (`App` dentro de
  `Providers`) pra evitar tela branca em erro de render; fallback simples
  com botão de retry.
- `@tanstack/react-query-devtools`: import condicional dev-only em
  `Providers.tsx` (`import.meta.env.DEV`), não entra no bundle de prod.

## Testing/validação

- Após cada item: `npm run build`, `npm run lint`, `npm run test` (regra
  já existente no `GEMINI.md`).
- Mudanças incrementais, um item por vez, conforme regra de "alterações
  em etapas pequenas" do projeto.

## Fora de escopo (fase 2)

Supabase: auth email/senha, tabela única `user_app_state` (jsonb por
usuário), sync com merge no login, localForage como cache offline. Spec
separada quando esta fase estiver concluída.
