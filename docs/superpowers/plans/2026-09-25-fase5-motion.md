# Fase 5: Motion completo (8 itens)

Plano para levar o Motion às partes do app que ainda não têm animação e ligar as animações de layout. **Executado em 25/09** (commits `6530c4d` a `46afa4e` na `dev`); ver "Notas de execução" no fim. Os custos de bundle foram medidos no build de 25/09.

Todas as regras do `docs/design-system/MASTER.md` continuam valendo:
- toda animação mostra causa e efeito, com 1–2 elementos animados por tela;
- anima só `transform` e `opacity`;
- nada infinito;
- entrada desacelera (`ease.out`) e saída acelera (`ease.in`), com ~65% da duração;
- com `prefers-reduced-motion`, o estado final aparece sem movimento.

## Onde estamos

| Já tem Motion | Não tem |
|---|---|
| Card do Pokémon (aura, sprite, barras de stats), abas (golpes em sequência), busca (dropdown), `Dialog`, drawer de favoritos (fundo), toast, botões do header | **Laboratório de Times inteiro**, análise do time, números dos stats, botão de favoritar, troca Pokédex ↔ Laboratório, indicador de aba, listas que perdem itens |

## Custos medidos

| Mudança | Bundle principal (gzip) | Chunk assíncrono de features (gzip) |
|---|---|---|
| Hoje (`domAnimation`) | 133,6 KB | 14,6 KB |
| `domAnimation` → `domMax` (itens 6, 7 e 8) | **+0,1 KB** | 14,6 → **28,1 KB** (+13,5) |
| Contador com `animate` + `useMotionValue` do Motion | **+12 KB** ❌ | — |
| Contador com `useSpring` do Motion | **+5,2 KB** ❌ | — |
| Contador com hook próprio (`requestAnimationFrame`) | ~0,3 KB ✅ | — |

Conclusões:
- **O `domMax` sai quase de graça no carregamento inicial.** As features já chegam por `import()` depois da primeira pintura, então os 13,5 KB extras vêm depois que a página já apareceu. A preocupação da Fase 4 (+14 KB) valia para o bundle principal, e ele não muda.
- **O contador de números não usa a API imperativa do Motion.** Ela puxaria o motor inteiro para o bundle principal. Um hook próprio com `requestAnimationFrame`, usando a mesma curva e a mesma duração da barra, custa ~0,3 KB e fica sincronizado.

**Orçamento da fase:** bundle principal no máximo +1,5 KB gzip. O chunk `TeamLab` pode crescer até ~4 KB (arrastar para reordenar).

## Ordem de execução

A tarefa agendada de hoje às 21h15 (estado vazio do 21st em `TeamSlotCard` e nos favoritos) **roda antes**. Os itens 1, 3 e 7 mexem nos mesmos arquivos.

```
5.0 Fundação ─┬─ 6 Indicador de aba   (valida o domMax no caso mais simples)
              ├─ 2 Stats contando
              ├─ 3 Favoritar
              ├─ 4 Pokédex ↔ Laboratório
              ├─ 1 Slots do time ──┐
              ├─ 7 Listas com layout ─┼─ 8 Arrastar para reordenar
              └─ 5 Destaque na análise
```

Cada item vira um commit na `dev`, com build, lint, test e e2e passando.

| # | Item | Tamanho |
|---|---|---|
| 5.0 | Fundação | P |
| 1 | Slots do time entram e saem | M |
| 2 | Stats contando | P |
| 3 | Favoritar com feedback | P |
| 4 | Transição Pokédex ↔ Laboratório | P |
| 5 | Destaque de mudanças na análise | M |
| 6 | Indicador de aba deslizando | P |
| 7 | Listas que fecham o buraco | M |
| 8 | Arrastar para reordenar o time | G |

---

## 5.0 Fundação

- [ ] `shared/ui/motion/features.ts`: `domAnimation` → `domMax`. Atualizar o comentário com os números medidos acima.
- [ ] `shared/ui/motion/tokens.ts`, tokens novos:
  - `layoutTransition = { duration: duration.base, ease: ease.out }` para `transition.layout`;
  - `pop` (escala `[1, 1.25, 1]`, 0,3 s) para confirmações;
  - `duration.flash = 0.9` para destaques de "isto mudou", que acontecem uma vez só.
- [ ] `shared/ui/motion/useCountUp.ts`: hook com `requestAnimationFrame` que vai de 0 ao valor com `duration.slow` e a curva `ease.out`. A curva é resolvida por um `cubicBezier` pequeno, próprio ou do Motion se custar < 0,5 KB (medir). Com reduced motion, devolve o valor final direto. Ganha teste unitário com timers falsos.
- [ ] `docs/design-system/MASTER.md`:
  - `domMax` passa a ser usado;
  - regras de `layout`: `layoutScroll` em container com scroll, `layout="position"` em conteúdo que não pode distorcer;
  - regras de arrastar: sempre por alça e sempre com alternativa sem arrastar (WCAG 2.5.7);
  - regra do contador (hook próprio, nunca `animate` imperativo).
- [ ] **E2E com animação ligada:** novo `e2e/motion.e2e.ts` com `test.use({ reducedMotion: 'no-preference' })`. Hoje todo o e2e roda com `reduce`, então nenhum teste vê uma animação acontecendo. Esse arquivo confere que:
  - o estado final chega;
  - nada estoura a largura da tela no meio de uma animação de layout;
  - interromper uma animação no meio (clicar de novo) não deixa a tela num estado errado.

## Item 1: slots do time entram e saem

**Causa e efeito:** um Pokémon entrou ou saiu do time.

- [ ] **Chave de render por Pokémon, não por posição.** Hoje a chave é `slot.id` (`team-1-slot-3`), que é posicional. O store e o sync continuam posicionais (`slot_index` no Supabase). Só a *chave do React* muda para a identidade do Pokémon (`pokemon.id` + ocorrência, porque o mesmo Pokémon pode aparecer duas vezes). Slot vazio continua com `slot.id`. É isso que deixa o Motion saber que "o Garchomp mudou de lugar" em vez de "o slot 3 mudou de conteúdo", e serve também para os itens 7 e 8.
- [ ] `TeamSlotCard`: o conteúdo fica dentro de `AnimatePresence mode="popLayout" initial={false}`.
  - Ao **remover**, o card sai (opacidade + escala 0,96, `ease.in`, `duration.exit`) e o slot vazio entra em fade.
  - A altura do slot muda (card cheio ~220 px, vazio ~112 px). O wrapper usa `layout` e o conteúdo usa `layout="position"` para os vizinhos do grid se ajustarem sem pulo e sem esticar o texto.
- [ ] **Trocar de time** (botões 1–6): os 6 slots entram em sequência (`stagger` de 40 ms, total ~0,25 s). O container é chaveado por `activeTeam.id`. Voltar para a aba "Time" vindo da "Análise" usa só fade, sem sequência, para não repetir a animação toda hora.
- [ ] **"Limpar" o time:** os cards saem em sequência inversa, rápida (20 ms).
- [ ] **Pokémon recém-adicionado brilha uma vez.** Ao adicionar pela Pokédex (`AddToTeamDialog`) e depois abrir o laboratório, o slot novo recebe um brilho dourado (camada com opacidade 0 → 0,6 → 0, `duration.flash`).
  - O "último adicionado" fica num store pequeno **sem persistência** em `features/team` (`useTeamHighlightStore`), fora do `teamStore`, para não ir para o localForage nem para o sync.
  - É consumido na primeira exibição.
- [ ] O `transition-transform` no sprite do editor (`TeamLabView`, header do Editor) vira `whileHover` do Motion ou fica só em CSS. Os dois juntos no mesmo `transform` não podem (regra do MASTER).

**Testes:**
- Unitário: `TeamSlotCard` mostra o vazio depois de remover (com `skipAnimations`, a saída termina na hora).
- E2E:
  - adicionar 2, abrir o laboratório, remover 1 → slot vazio no lugar, sem overflow nas 5 telas;
  - trocar de time → 6 slots visíveis.
- `motion.e2e.ts`: remover e trocar de time no meio da saída não duplica nem perde card.

## Item 2: stats contando junto com a barra

**Causa e efeito:** chegou um Pokémon novo e os números "enchem" junto com as barras.

- [ ] `PokemonCard` → `StatBar`: o número usa `useCountUp(value)` com a mesma duração e a mesma curva da barra (`duration.slow`, `ease.out`).
- [ ] **Nova linha "Total"** (soma dos stats base, que é a referência de competitivo), também contando.
- [ ] Números com `tabular-nums`, para a largura não tremer durante a contagem.
- [ ] **Acessibilidade:** o número animado fica `aria-hidden`, e ao lado vai um `sr-only` com o valor final. Leitor de tela nunca lê "12… 37… 80".
- [ ] **Fora:** os stats calculados do Editor (EVs/IVs). Lá o número muda enquanto a pessoa arrasta o controle, e contagem só atrapalharia.

**Testes:** unitário do hook (valor final, reduced motion, troca de valor no meio). E2E: o texto final do Total bate com a soma.

## Item 3: favoritar com feedback

**Causa e efeito:** a pessoa favoritou ou desfavoritou.

- [ ] **Botão de coração** (`PokemonCard`):
  - `m.button` com `pop` quando vira favorito;
  - encolhe levemente (0,9 → 1) quando deixa de ser;
  - `whileTap` igual ao CTA.
- [ ] Correção junto: o botão ganha `aria-pressed={isFavorite}`. Hoje o leitor de tela não sabe se já está favoritado. O nome "Favoritar" continua o mesmo (o e2e usa esse nome).
- [ ] Trocar o `transition-all` desse botão por `transition-[color,background-color,border-color,box-shadow,translate]` (regra do MASTER: o Motion anima `transform`).
- [ ] **Drawer de favoritos:** o item removido sai deslizando para a direita (x + opacidade, `ease.in`). Os vizinhos sobem suavemente (depende do item 7).
- [ ] **Foco ao remover:** hoje, remover um favorito pelo teclado deixa o foco solto, porque o botão some. Depois de remover, o foco vai para o botão de remover do próximo item, ou para o título do drawer se a lista ficou vazia.

**Testes:** unitário do drawer (foco depois de remover). E2E: favoritar → `aria-pressed="true"`.

## Item 4: transição Pokédex ↔ Laboratório

**Causa e efeito:** mudou de tela. Hoje a troca é um corte seco, inclusive no botão voltar do navegador.

- [ ] `App.tsx`: a troca de view fica dentro de `AnimatePresence mode="wait" initial={false}`, com `m.div key={activeView}`.
  - Entrada: fade + deslize de 16 px.
  - Saída: só fade, curta.
  - O `Suspense` do `TeamLab` fica dentro do bloco animado.
- [ ] **Direção:** ir para o laboratório entra pela direita; voltar entra pela esquerda (`custom` do `AnimatePresence`, com base na view de origem). Vale também para voltar/avançar do navegador.
- [ ] O header não anima. Só o conteúdo abaixo dele troca.
- [ ] **Foco:** depois da troca (não na primeira carga), o foco vai para o título da nova tela (`tabIndex={-1}`). Hoje quem usa teclado ou leitor de tela fica com o foco num botão que sumiu.
- [ ] Manter o comportamento atual de scroll. Conferir no e2e que o botão voltar continua levando para a view certa.

**Testes:** o `navigation.e2e.ts` atual precisa continuar verde. No `motion.e2e.ts`: clicar "Meu Time" e voltar rapidamente termina na view certa (animação interrompível).

## Item 5: destaque de mudanças na análise

**Causa e efeito:** a composição do time mudou, e a análise mostra *o que* mudou.

O problema é que a aba "Análise" só existe na tela quando está aberta, e a mudança no time acontece nas abas "Time" ou "Editor". Quando a pessoa volta para a Análise, o componente monta de novo e não sabe o que era antes.

- [ ] **Snapshot da última visita** em memória no `TeamLabView` (`Map<teamId, snapshot>`), sem persistir. Ele guarda:
  - `weakTo` por tipo;
  - tipos cobertos;
  - imunidades.
- [ ] **Função pura `diffTeamAnalysis(anterior, atual)`** em `features/type-analysis/lib`, que é onde os dados de tipo moram (AGENTS.md). Ganha teste unitário.
- [ ] Ao abrir a Análise, cada linha que mudou ganha:
  - um selo de diferença, "+1" (tom `danger`, mais fraquezas) ou "−1" (tom `success`), com `aria-label` por extenso ("1 fraqueza a mais que antes");
  - um brilho que acontece uma vez (camada com opacidade, `duration.flash`).
- [ ] Linhas novas (fraqueza que passou a ser comum, tipo que passou a ser coberto) entram com `fadeRise` em sequência.
- [ ] **Região `aria-live="polite"`** com o resumo: "Fraqueza a Gelo subiu para 3. Agora cobre Dragão."
- [ ] Na primeira visita não há destaque, porque não existe antes.

**Testes:** unitário do `diffTeamAnalysis`. E2E:
1. abrir a Análise;
2. voltar para "Time" e remover um Pokémon;
3. abrir a Análise de novo → o selo aparece com o texto certo.

## Item 6: indicador de aba deslizando

**Causa e efeito:** mudou de aba, e o destaque "viaja" até a aba nova.

- [ ] `PokemonTabs`: o visual da aba ativa (fundo `gilt/10`, borda, brilho) sai do botão e vira um `m.span` com `layoutId` atrás do texto. O botão fica `relative`, só com a cor do texto.
- [ ] A barra de abas tem `overflow-x-auto`. Ela vira `m.div` com `layoutScroll`, senão o Motion mede errado quando a barra está rolada (celular).
- [ ] Ao trocar de aba, a aba ativa rola para dentro da vista (`scrollIntoView({ inline: 'nearest', block: 'nearest' })`). Hoje, no celular, a aba ativa pode ficar meio cortada.
- [ ] O conteúdo da aba entra em fade de `duration.fast`, sem esperar a saída, para a troca continuar instantânea.
- [ ] O mesmo indicador vai para as abas do laboratório (Time/Análise) e para o seletor de time (1–6). Cada barra tem um `LayoutGroup id` próprio, para os indicadores não "pularem" de uma barra para outra.
- [ ] Os botões das abas deixam de ter `transition-all`.
- [ ] Com reduced motion, `reducedMotion="user"` já desliga animação de layout, e o indicador só troca de lugar.

**Testes:** E2E na tela de 280 px: selecionar a última aba → ela fica inteira visível. `aria-selected` continua certo.

## Item 7: listas que fecham o buraco

**Causa e efeito:** um item saiu ou mudou de posição, e os outros se reorganizam em vez de pular.

- [ ] **Favoritos (drawer):** itens `m.article layout`, `AnimatePresence mode="popLayout" initial={false}`, `layoutScroll` na lista com scroll.
- [ ] **Recentes:** ao buscar de novo um Pokémon que já estava na lista, ele sobe para o topo deslizando, e o novo entra no topo em fade. `layoutScroll` na lista com scroll do desktop.
- [ ] **Slots do time:** o item 1 já liga o `layout`. Aqui entra o ajuste fino com o item 8.
- [ ] **Linhas da análise** (item 5): fraquezas reordenadas pelo total deslizam para a nova posição.
- [ ] **Não entra:** sugestões da busca. A lista muda a cada tecla, e animar layout a cada tecla fica lento e confuso. Continua como está.
- [ ] Transição de layout com `layoutTransition` (0,24 s, `ease.out`).

**Testes:** o `visual-regressions.e2e.ts` ("cards de favoritos não se sobrepõem") precisa continuar verde. No `motion.e2e.ts`: remover o 2º de 4 favoritos → no fim da animação os 3 cards não se sobrepõem e o scroll não pulou.

## Item 8: arrastar para reordenar o time

**Causa e efeito:** a pessoa muda a ordem do time (quem sai na frente importa no competitivo).

**Store e sync:**
- [ ] `teamStore.moveSlot(teamId, de, para)`: move o *conteúdo* (Pokémon) entre as posições. Os `slot.id` continuam posicionais, porque o sync grava por `slot_index`.
  - Carimba `updatedAt` pelo `stampChangedTeams` que já existe, então o last-write-wins do sync funciona sem mudança.
  - Ganha teste no `teamStore.test.ts`.
- [ ] Conferir em `app/cloudSync/syncTeams.ts` que o push grava todas as posições que mudaram, com teste no cliente falso: mover o 1º para o 3º → 3 linhas de `team_slots` atualizadas.

**Modo "Organizar"** (em vez de alça sempre visível):
- [ ] Um botão "Organizar" na aba Time liga o modo.
- [ ] Com o modo ligado:
  - cada card mostra uma **alça** (`GripVertical`, 44×44) e dois botões **"Mover para trás" / "Mover para frente"**;
  - "Editar" e "Remover" somem;
  - os cards ficam num tom levemente diferente.
- [ ] O modo separado evita arrastar sem querer ao rolar a página e mantém o card limpo no uso normal, principalmente em 280–375 px.

**Arrastar:**
- [ ] `drag` com `useDragControls` e `dragListener={false}`: o arrasto só começa pela alça, que tem `touch-action: none`. No resto do card, o dedo continua rolando a página.
- [ ] Funciona no grid de 1, 2 e 3 colunas: durante o arrasto, o destino é o slot cujo centro está mais perto do ponteiro. A ordem muda em estado local, e os vizinhos deslizam com `layout`.
- [ ] O store só é gravado **ao soltar** (1 escrita e 1 sync, não 20).
- [ ] **Rolagem automática** perto das bordas da tela. No celular, com 1 coluna, o time tem ~1.300 px de altura, maior que a tela.
- [ ] `Esc` durante o arrasto cancela e devolve à posição original.
- [ ] O card arrastado fica levemente maior (escala 1,03, sombra mais forte) e acima dos outros (`z-index`).

**Sem arrastar (obrigatório, WCAG 2.5.7):**
- [ ] Os botões "Mover para trás/frente" fazem o mesmo movimento com um toque ou pelo teclado, com a mesma animação de layout.
- [ ] O foco acompanha o card que se moveu.
- [ ] **Anúncio `aria-live`:** "Garchomp movido para a posição 3 de 6."

**Seleção:**
- [ ] `selectedSlotIndex` acompanha o Pokémon que se moveu, para "Editar" depois de organizar abrir o Pokémon certo.

**Testes:**
- Unitário: `moveSlot`, e o `TeamLabView` com os botões mover e o foco.
- E2E:
  - desktop: arrastar com o mouse o slot 1 para o 3 → ordem nova e persistida depois do reload;
  - celular e fold: os botões mover;
  - tablet (toque): arrasto por eventos de toque via CDP.
- `motion.e2e.ts`: nada estoura a largura da tela durante o arrasto.

---

## Verificação (toda tarefa)

- `npm run build && npm run lint && npm run test` e `npm run test:e2e` (5 tipos de tela + `motion.e2e.ts`).
- Bundle principal dentro do orçamento (+1,5 KB gzip no total da fase), medido a cada commit.
- **Desempenho:** trace do Playwright com a CPU 4× mais lenta nas telas de laboratório e favoritos. Nenhuma tarefa longa (> 50 ms) causada por animação, e nenhum deslocamento de layout (CLS) fora das animações de propósito.
- Harness de QA visual (375 e 1280 px) com screenshots no meio e no fim das animações.
- Reduced motion ligado: tudo aparece no estado final, e arrastar e reordenar continuam funcionando.
- **Teste manual num celular de verdade**, principalmente o item 8. iOS Safari tem particularidades de toque que o Chromium do CI não pega.

## Riscos

| Risco | Como evitar |
|---|---|
| Animação de layout medindo errado dentro de área com scroll | `layoutScroll` em todo container com `overflow-auto` (abas, drawer, recentes) |
| Conflito entre `transition-*` do Tailwind e o `transform` do Motion | Tirar `transition-all`/`transition-transform` dos elementos que o Motion anima (regra do MASTER) |
| Arrastar sequestrar a rolagem no celular | Arrasto só pela alça (`touch-action: none` só nela), e só no modo Organizar |
| Reordenar gerar muitas escritas no sync | Grava só ao soltar |
| `popLayout` exige pai com posição definida | Containers das listas com `relative` |
| Animação demais na mesma tela (regra de 1–2) | Cada item anima só na hora da causa (entrar, sair, mudar), nunca em repouso |

## Fora do escopo

- Parallax, animação disparada por scroll, sprite em loop, efeitos só decorativos.
- Navegação por setas nas abas (padrão ARIA de tabs completo). É acessibilidade, não Motion; vale como tarefa separada.
- `TeamAnalysisPanel` (`features/type-analysis`) está exportado mas não é usado em lugar nenhum. Remover ou usar é outra decisão.
- "Desfazer" no toast ao remover favorito ou Pokémon do time.

---

## Notas de execução (25/09)

Os 8 itens foram entregues, um commit cada, com build, lint, testes unitários e e2e passando.

**O que mudou em relação ao plano:**
- **Bug na suíte e2e, anterior a esta fase:** `reducedMotion: 'reduce'` solto no `use` do Playwright não é opção válida e era ignorado. A suíte inteira rodava com animações ligadas. Passou a usar `contextOptions`, e cada lado ganhou um teste de guarda (commit separado, `2f05814`).
- **`layoutDependency` obrigatório nas listas.** Sem ele, os tipos dos favoritos, que só carregam quando o drawer abre, faziam os cards deslizarem e se sobreporem por ~0,3 s. Virou regra no MASTER.md.
- **O diff da análise (item 5) ficou em `features/team/lib/analysisDiff.ts`**, não em `type-analysis`. Pelo barrel de `type-analysis`, que a Pokédex já carrega, ele entrava no bundle principal. Não tem tabela de tipos, então não fere a regra do AGENTS.md.
- **Item 8:**
  - a alça fica na linha de ações (alça | Antes | Depois), não no canto do card: lá ela ficava por baixo da coluna de texto (`z-[1]`) e cobria nome e tipos nas telas estreitas;
  - a rolagem automática só começa quando o dedo vai em direção à borda (16 px), senão pegar um card perto do rodapé já rolava a página sozinho;
  - Esc usa `dragControls.stop()`, então o card solta o ponteiro e volta na hora;
  - `moveSlot` move o slot inteiro (ids juntos); o sync continua por `slot_index`.
- **Item 4:** o deslize de 16 px criava 2 px de rolagem lateral em 740 px no meio da animação, e o container do app ganhou `overflow-x-clip`. A região da tela nova recebe foco (sem anel, com `!` porque a regra global de foco não está em layer).
- **E2E:** trocar de Pokémon com `page.goto` logo depois de favoritar pode chegar antes da escrita assíncrona no IndexedDB. O helper `visitPokemon` troca sem reload.

**Orçamento (gzip):**

| Chunk | Antes | Depois | Meta | Resultado |
|---|---|---|---|---|
| Principal | 133,6 KB | 135,5 KB | +1,5 KB | **+1,9 KB, estourou 0,4 KB** |
| Features do Motion (assíncrono) | 14,6 KB | 28,0 KB | ~28 KB | ok |
| Laboratório (assíncrono) | 9,8 KB | 14,1 KB | ~+4 KB | +4,3 KB |

**Desempenho** (Playwright, 375 px, CPU 4× mais lenta, comparado com o build de antes da fase):
- **CLS 0 em tudo.**
- Troca de aba e abrir a análise já tinham tarefas longas antes (55–100 ms) e continuam iguais.
- Algumas interações novas (abrir o laboratório, remover slot, voltar para Time, abrir e remover favorito) passaram a ter às vezes **uma tarefa de 51–57 ms**, no começo das animações de layout, quando antes tinham nenhuma. A meta de "nenhuma tarefa > 50 ms causada por animação" **não foi cumprida por 1–7 ms**. É candidata a otimização, por exemplo reduzir quantos elementos medem layout de uma vez.

**Não verificado aqui:** arrastar num celular de verdade (iOS Safari). O toque foi testado no Chromium com eventos de toque via CDP.

**Achado fora do escopo:** o brilho da aba ativa no laboratório é cortado num retângulo pela barra com scroll (`overflow-x-auto`). Já estava assim antes da Fase 5.
