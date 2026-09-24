# Archivum Arceus

App web mobile-first para consulta, análise e montagem de times Pokémon, usando dados da PokeAPI. Pokémon, aba e tela ficam na URL — dá pra compartilhar o link de um Pokémon (`?pokemon=garchomp&tab=golpes`). Também instalável como PWA (opcional — quem quiser ícone na tela e uso offline). Login é opcional — o app funciona 100% sem conta; quem cria conta ganha sincronização entre dispositivos.

O app fica em [`arce-dex/`](./arce-dex). A raiz do repositório existe só pra abrigar isso, CI e docs — não tem código próprio nem `package.json`.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand (estado) + TanStack Query (fetch/cache)
- localForage (persistência local, funciona offline/deslogado)
- Supabase (auth por email/senha + Postgres + Realtime para sync entre dispositivos, opcional)
- vite-plugin-pwa (deixa instalável e com cache offline — feature opcional, não o foco do app)
- Vitest (testes)
- Docker (dev com hot-reload + build de produção)
- Deploy: Vercel

## Rodando o projeto

**Com Docker (recomendado, não precisa instalar Node):**

```bash
cd arce-dex
docker compose up dev   # http://localhost:5173, hot-reload
docker compose up web   # http://localhost:8080, build de produção via nginx
```

**Sem Docker:**

```bash
cd arce-dex
npm install
npm run dev
```

Outros comandos (rodar de dentro de `arce-dex/`): `npm run build`, `npm run lint`, `npm run test`.

## Documentação

- [`AGENTS.md`](./AGENTS.md) — contexto pra quem (ou qual agente de IA) for mexer no código: arquitetura, convenções, decisões.
- [`docs/superpowers/`](./docs/superpowers) — specs e planos das reestruturações já feitas no projeto (histórico de decisões).
