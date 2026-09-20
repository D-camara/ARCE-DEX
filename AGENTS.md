# AGENTS.md

Contexto pra quem (humano ou agente de IA — Codex, Claude Code, Cursor, etc.) for mexer neste repositório.

## O que é

**Archivum Arceus**: PWA mobile-first pra consultar Pokémon, analisar tipos/efetividade e montar times competitivos. Dados vêm da [PokeAPI](https://pokeapi.co).

## Onde fica o quê

```
ARCE-DEX/                  ← raiz do repo, sem código próprio
├── arce-dex/               ← o app de verdade, TUDO roda daqui
│   ├── src/
│   │   ├── app/            App.tsx (composição), providers, hooks de estado da UI
│   │   ├── features/       um dir por feature de produto
│   │   │   ├── pokemon/
│   │   │   ├── search/
│   │   │   ├── favorites/
│   │   │   ├── team/
│   │   │   └── type-analysis/
│   │   └── shared/         código sem dono único: ui, lib, services (PokeAPI client), types, settingsStore
│   ├── Dockerfile           multi-stage: base → dev / build → runtime (nginx)
│   ├── docker-compose.yml   serviços `dev` (hot-reload) e `web` (prod)
│   └── package.json
├── .github/workflows/ci.yml lint + test + build em todo push/PR
└── docs/superpowers/         specs e planos das reestruturações já feitas (histórico, ver abaixo)
```

Dentro de cada `features/<nome>/`, o padrão é: `components/`, `hooks/`, `store/` (quando tem), `lib/` (quando tem), e um `index.ts` que reexporta a API pública da feature. Código de fora da feature importa **só** pelo barrel (`@/features/pokemon`), nunca por caminho interno (`@/features/pokemon/components/...`) — exceto dentro da própria feature.

## Stack e por quê

| Peça | Escolha | Por quê |
|---|---|---|
| Framework | React 19 + Vite | já estava, funciona bem, sem motivo pra trocar |
| Linguagem | TypeScript, `strict: true` | pega bug em tempo de build |
| Estilo | Tailwind CSS v4 | **CSS puro foi removido do projeto inteiro** — não escreve mais `.css` com regras, só utilitário Tailwind (ver `src/index.css`, só tem `@theme` + reset) |
| Estado | Zustand + `persist` (localForage) | estado de UI simples, persistência offline sem backend |
| Fetch/cache | TanStack Query | cache de chamadas à PokeAPI |
| PWA | vite-plugin-pwa | instalável, cache offline de dados/sprites da PokeAPI |
| Testes | Vitest | testes de store ficam junto do arquivo (`fooStore.test.ts` ao lado de `fooStore.ts`) |
| Container | Docker (dev + prod) | não precisa Node instalado na máquina pra rodar |
| Deploy | Vercel | builda direto do repo — **Root Directory no dashboard da Vercel precisa ser `arce-dex`**, senão o build quebra |

Alias de import: `@/` aponta pra `arce-dex/src/`.

## Como rodar

```bash
cd arce-dex
docker compose up dev   # http://localhost:5173, hot-reload
```

Sem Docker: `npm install && npm run dev` (mesma pasta).

Antes de qualquer commit: `npm run build && npm run lint && npm run test` (dos três dentro de `arce-dex/`) precisam passar limpos.

## Convenções

- **Feature-based, não por tipo técnico.** Não recriar `components/`, `hooks/`, `stores/` soltos na raiz de `src/` — isso já foi extinto de propósito.
- **Sem CSS custom.** Se precisar de algo que Tailwind não cobre direto, usa classe arbitrária (`bg-[rgba(...)]`) inline no componente, não adiciona regra em `index.css`.
- **Zustand store = `create(persist(...))`** com storage em `@/shared/lib/storage` (localForage). Ver qualquer store existente como referência.
- **Dado de tipo/efetividade de Pokémon** mora em `features/type-analysis` — não duplicar tabela de tipos em outro lugar.
- **Nunca commitar sem rodar build+lint+test** (regra de verdade, não sugestão).

## O que já foi feito (histórico)

Duas fases de refatoração de stack já concluídas — specs e planos completos em `docs/superpowers/`:

- **Fase 0** — reestruturação de `src/` pra feature-based (era tudo solto por tipo técnico antes).
- **Fase 1** — TypeScript strict, migração 100% pra Tailwind, PWA de verdade, testes de store, Docker, CI, error boundary.

## O que falta

- **Fase 2 (não iniciada): Supabase** — auth (email/senha) + sync de favoritos/times entre dispositivos, com localForage virando cache offline em vez de única fonte de verdade. Sem spec escrita ainda.
- Validar o Dockerfile de produção com carga real (só foi smoke-testado).
