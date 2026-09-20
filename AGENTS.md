# AGENTS.md

Contexto pra quem (humano ou agente de IA — Codex, Claude Code, Cursor, etc.) for mexer neste repositório.

## O que é

**Archivum Arceus**: app web mobile-first pra consultar Pokémon, analisar tipos/efetividade e montar times competitivos. Dados vêm da [PokeAPI](https://pokeapi.co). Também dá pra instalar como PWA (ícone, uso offline) — isso é uma opção pro usuário, não o foco do produto, que é web.

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
├── .mcp.json               MCP servers do projeto (hoje só o Supabase) — versionado, sem segredo
├── .agents/skills/          skills reais (Supabase, etc.), instaladas via `npx skills add`
├── skills-lock.json         lockfile de quais skills estão instaladas e de onde vieram
├── .serena/                 config do Serena (MCP de navegação/edição de código via LSP)
└── docs/superpowers/         specs e planos das reestruturações já feitas (histórico, ver abaixo)
```

Dentro de cada `features/<nome>/`, o padrão é: `components/`, `hooks/`, `store/` (quando tem), `lib/` (quando tem), e um `index.ts` que reexporta a API pública da feature. Código de fora da feature importa **só** pelo barrel (`@/features/pokemon`), nunca por caminho interno (`@/features/pokemon/components/...`) — exceto dentro da própria feature.

### Sobre as pastas de agente de IA (`.agents`, `.claude`, `.serena`, `skills/`)

Cada ferramenta de IA espera suas configs num lugar fixo, então não dá pra consolidar isso numa pasta só:

- **`.agents/skills/`** — onde as skills instaladas (`npx skills add <fonte>`) realmente moram. É o que fica versionado.
- **`.claude/skills/`** e **`skills/`** (raiz) — atalhos (symlink) pra `.agents/skills/`, exigidos por Claude Code e por outras ferramentas que só olham nesses caminhos. **Não são versionados** (git nessa máquina não lida bem com symlink pra caminho absoluto) — se sumirem depois de um `git clone`, roda `npx skills add supabase/agent-skills` de novo que ele recria.
- **`.claude/settings.local.json`** — preferências locais do Claude Code (ex: MCP aprovado/rejeitado nesta máquina). Não versionado, cada um tem o seu.
- **`.serena/`** — config do Serena (navegação de código via LSP); `project.yml` é versionado, o resto (`cache/`, `memories/`) é próprio de cada máquina.

## Stack e por quê

| Peça | Escolha | Por quê |
|---|---|---|
| Framework | React 19 + Vite | já estava, funciona bem, sem motivo pra trocar |
| Linguagem | TypeScript, `strict: true` | pega bug em tempo de build |
| Estilo | Tailwind CSS v4 | **CSS puro foi removido do projeto inteiro** — não escreve mais `.css` com regras, só utilitário Tailwind (ver `src/index.css`, só tem `@theme` + reset) |
| Estado | Zustand + `persist` (localForage) | estado de UI simples, persistência offline sem backend |
| Fetch/cache | TanStack Query | cache de chamadas à PokeAPI |
| PWA (opcional) | vite-plugin-pwa | deixa o app instalável e com cache offline — feature extra, não o foco (o produto é web) |
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

Três fases de refatoração/evolução já concluídas — specs e planos completos em `docs/superpowers/`:

- **Fase 0** — reestruturação de `src/` pra feature-based (era tudo solto por tipo técnico antes).
- **Fase 1** — TypeScript strict, migração 100% pra Tailwind, PWA de verdade, testes de store, Docker, CI, error boundary.
- **Fase 2** — Supabase: auth (email/senha, confirmação de email obrigatória) + sync em tempo real de favoritos, times, histórico de busca e configurações entre dispositivos. `features/auth` cuida da sessão; `app/useCloudSync.ts` + `app/cloudSync/` fazem o pull/push/Realtime por tabela. localForage continua sendo a persistência local — funciona 100% offline/deslogado, sync é camada opcional por cima.

## O que falta

- Validar o Dockerfile de produção com carga real (só foi smoke-testado).
- Reset de senha e OAuth ficaram fora do escopo da Fase 2 (ver `docs/superpowers/specs/2026-09-20-supabase-sync-design.md`).
