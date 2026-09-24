# Fase 4: Evolução do design (ui-ux-pro-max + Motion + 21st.dev)

Plano **e análise de viabilidade**. Nada daqui foi implementado ainda. Cada ferramenta foi testada na prática antes de entrar no plano: instalação, tamanho, compatibilidade e acesso de rede.

## Resumo: dá para usar as três?

| Ferramenta | Veredito | Condição |
|---|---|---|
| **ui-ux-pro-max** (skill de diretrizes de UI/UX) | ✅ Sim, testado | Nenhuma. Instala pelo mesmo `npx skills add` que o projeto já usa e roda offline. |
| **Motion** (animações, motion.dev) | ✅ Sim, testado | A biblioteca instala pelo npm. O **site de docs está bloqueado** no ambiente, mas dá para trabalhar pelos tipos e pelo README do pacote. Custo: ~30 KB gzip no bundle. |
| **21st.dev** (componentes) | ⚠️ Possível, com pré-requisitos | **O domínio `21st.dev` está bloqueado** no ambiente, e sem ele não há como baixar componentes. Precisa liberar a rede. Talvez precise de API key. |

## 1. ui-ux-pro-max

**Testado:** instalação numa pasta de teste com `npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max`.
- Escreve em `.agents/skills/ui-ux-pro-max/`, cria o atalho em `.claude/skills/` e registra no `skills-lock.json`. É exatamente o padrão das skills do Supabase que o repo já tem (ver `AGENTS.md`).
- O script de busca é Python só com biblioteca padrão. Não acessa rede e não instala nada (código auditado).
- **Tamanho: 3,6 MB**, quase tudo CSVs de dados. As skills atuais somam ~200 KB. Recomendo versionar mesmo assim, por consistência (`skills-lock.json` + pasta).

**Como entra no projeto:**
- Referência de qualidade: checklist de acessibilidade, toque, motion e formulários, que já usei na revisão mobile (PR #26).
- `--design-system` para gerar um `MASTER.md` de design do produto, salvo em `docs/design-system/` com `--output-dir`. **Não** para trocar a identidade atual (escuro/cósmico/dourado). O uso é para consolidar regras: escala tipográfica, espaçamento, tokens de motion.
- `--domain ux` / `--stack react` para dúvidas pontuais durante a implementação.

## 2. Motion (`motion`, ex-framer-motion)

**Testado:** `npm view` + instalação numa pasta de teste + bundle medido com esbuild.
- `motion@13.4.3`, licença MIT, peer deps `react ^18 || ^19`. Compatível com o nosso React 19 + Vite.
- Import em `motion/react`. Com `LazyMotion`, os componentes vêm de `motion/react-m`.

**Custo no bundle (gzip, medido):**

| Uso | Custo |
|---|---|
| `LazyMotion` + `domAnimation` (animate, exit, gestos, variants) | **~28–30 KB** |
| `domMax` / `motion.div` completo (inclui layout animations, `layoutId`) | ~43 KB |
| Bundle atual do app | 168 KB |

Ou seja, +18% com `domAnimation`, ou +26% com layout animations. Com o esbuild, o carregamento sob demanda dos recursos quase não reduziu o custo inicial. O Vite/Rollup pode fazer melhor, e isso precisa ser medido na hora.

**Como compensar:** code-splitting do laboratório de times e do Supabase/auth. Isso já era item pendente, porque o build avisa que o chunk passa de 500 KB. A meta é o bundle inicial não crescer, ou crescer ≤ 10 KB líquidos.

**Docs:** `motion.dev` está bloqueado no ambiente. Consigo trabalhar pelos tipos TypeScript e pelo README do pacote. Liberar o domínio é recomendável, mas não obrigatório.

## 3. 21st.dev

**Como funciona (verificado pelo repositório `21st-dev/skill` e pelo blog do 21st):**
- É um catálogo de componentes React/Tailwind **no formato do shadcn/ui**.
- Instalar **copia o código-fonte** para o projeto (não é pacote npm): `npx shadcn@latest add "https://21st.dev/r/<autor>/<componente>"` ou a CLI `@21st-dev/cli` (`21st add`).
- O comando baixa o JSON do item, instala as dependências npm que ele declara (Radix, motion etc.) e escreve os arquivos onde o `components.json` manda.
- Existe uma skill oficial para agentes (`npx skills add 21st-dev/skill`), que ensina a CLI: `search`, `get`, `add`.
- **Busca e metadados são grátis. Baixar o código tem cota diária grátis e pode exigir API key** (`21st.dev/settings/api-keys`, via variável `TWENTYFIRST_TOKEN`). Segundo a skill, itens públicos também saem pelo `shadcn add` puro.

**Bloqueios hoje:**
1. **`21st.dev` bloqueado pela política de rede do ambiente.** Sem isso não baixo nada: nem CLI, nem `shadcn add`, nem a página. **É preciso liberar.**
2. Talvez uma API key, configurada como secret do ambiente, se o `shadcn add` puro não bastar.
3. **Alternativa sem rede:** você escolhe no site, copia o código do componente e cola aqui (ou num arquivo). Funciona, só é mais manual.

**Trabalho de adaptação (vale para qualquer componente do 21st):**
- **O projeto não tem shadcn configurado** (não existe `components.json`). O plano é configurar **à mão**, sem rodar `shadcn init`, porque o `init` reescreve o `index.css`:
  - `components.json` apontando `ui` para `@/shared/ui` e `utils` para `@/shared/lib/utils`, respeitando a estrutura por feature do `AGENTS.md`;
  - função `cn` (`clsx` + `tailwind-merge`, ~4 KB).
- **Ponte de tokens:** os componentes shadcn usam `bg-background`, `text-muted-foreground`, `border-input`, `ring-ring` etc. Esses nomes seriam mapeados para a nossa paleta no `@theme`, então qualquer componente instalado já sai com a cara do Archivum Arceus.
- **Cada componente passa por revisão antes de entrar:**
  - trocar cores literais por tokens (a regra de lint vai acusar);
  - remover imports de Next.js (`next/image`, `next/link`), se houver;
  - não trazer outro Dialog/Popover do Radix quando já temos o `Dialog` próprio;
  - checar acessibilidade e `prefers-reduced-motion`;
  - conferir a licença do autor (o catálogo é da comunidade, então a qualidade e a licença variam por componente).

## Plano de execução (depois da sua aprovação)

### 4.0 Preparação (não depende de rede nova)
- [ ] Instalar e versionar a ui-ux-pro-max (`npx skills add ...`) e documentar no `AGENTS.md`.
- [ ] Gerar o `MASTER.md` de design com a skill, a partir da identidade atual, em `docs/design-system/`. Incluir tokens de motion (durações, easings, springs) e escala tipográfica.
- [ ] Levar para o repositório a auditoria mobile e os screenshots (Playwright + PokeAPI falsa) como `npm run test:visual` / `test:e2e`. Assim cada animação ou componente novo é verificado automaticamente.
- [ ] Code-splitting (laboratório de times, auth/Supabase) para abrir espaço no bundle antes de adicionar o Motion.

### 4.1 Fundação de motion
- [ ] `npm i motion`.
- [ ] Criar `shared/ui/motion/`:
  - `MotionProvider` com `LazyMotion` (`strict`) e `MotionConfig reducedMotion="user"`;
  - tokens de duração, easing e spring vindos do `MASTER.md`.
- [ ] Regra de lint: importar só `m` de `motion/react-m`, nunca `motion.*` completo nem `framer-motion`, para o bundle não inflar sem ninguém notar.
- [ ] Os testes de screenshot rodam com `reducedMotion: 'reduce'` (já é assim hoje), então continuam determinísticos.

### 4.2 Animações, por ordem de impacto
Regra da skill: toda animação precisa expressar causa e efeito, com 1–2 elementos animados por tela.

1. **Diálogos e drawer:** entrada e **saída** animadas (`AnimatePresence`). Hoje eles aparecem e somem de repente. Precisa ajustar o `Dialog` para continuar montado durante a saída sem quebrar foco e `inert`.
2. **Dropdown da busca:** abrir e fechar, mais o destaque suave da sugestão ativa.
3. **Troca de Pokémon:** crossfade do card e entrada do sprite.
4. **Barras de stats:** crescem ao carregar.
5. **Listas:** golpes e slots do time entram em sequência (stagger de 30–50 ms).
6. **Toast:** entrada e saída.
7. **Toque:** feedback de pressionar (`whileTap` com escala ~0,97) nos botões principais.
8. **Indicador de aba deslizando** (`layoutId`): exige `domMax`, +14 KB. **Decisão sua**, porque dá para fazer parecido só com CSS.
- [ ] Substituir as animações CSS atuais onde o Motion assumir (`fade-in-backdrop`), mantendo `prefers-reduced-motion`.

### 4.3 Componentes do 21st.dev (depende de liberar a rede)
- [ ] Configurar o shadcn à mão (`components.json`, `cn`, ponte de tokens).
- [ ] Instalar a skill do 21st (`npx skills add 21st-dev/skill`).
- [ ] Você escolhe os componentes no site (ou eu busco pela CLI, se a rede permitir). Candidatos naturais:
  - loaders/skeletons do card;
  - número animado nos stats;
  - efeito de hover/spotlight nos cards;
  - estado vazio;
  - badges de tipo mais ricas;
  - cards de time.
- [ ] Cada componente vira 1 commit: instalar, adaptar (tokens, a11y, reduced motion), mover para a feature certa, teste se tiver interação, screenshot e auditoria mobile.

### Verificação (toda tarefa)
- `npm run build && npm run lint && npm run test`.
- Auditoria mobile: toque ≥ 44 px, texto ≥ 12 px, nada vazando da tela.
- Tamanho do bundle comparado com a meta.
- Reduced motion ligado desliga as animações.

## O que preciso de você

1. **Rede:** liberar `21st.dev` (obrigatório para os componentes) e `motion.dev` (recomendado, para as docs) em *Network access* nas configurações do ambiente.
2. **API key do 21st**, só se o `shadcn add` pedir, cadastrada como secret do ambiente.
3. **Orçamento de bundle:** aceita o Motion (~30 KB gzip) compensado com code-splitting? E o indicador de aba com `layoutId` (+14 KB) ou em CSS?
4. **Quais componentes do 21st** você quer (links do site).
5. Tudo bem **versionar os 3,6 MB** da skill ui-ux-pro-max?
