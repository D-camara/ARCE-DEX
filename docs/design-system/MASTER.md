# Archivum Arceus: Design System (MASTER)

Fonte da verdade para decisões visuais e de movimento. As regras aqui valem para o app inteiro. Os tokens de cor e breakpoint moram em `arce-dex/src/index.css` (`@theme`), e os de movimento em `arce-dex/src/shared/ui/motion/tokens.ts`.

Para diretrizes gerais de UI/UX, use a skill **ui-ux-pro-max** (`.agents/skills/ui-ux-pro-max`):

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<intenção em 2-5 termos>" --domain ux
```

> O modo `--design-system` da skill foi testado para este produto e sugeriu landing page roxa clara com fonte monoespaçada. **Não se aplica**: o Archivum Arceus é uma ferramenta, não uma landing page, e tem identidade própria. Use a skill para regras pontuais (`--domain ux`), não para trocar a identidade.

## Identidade

- **Tom:** grimório cósmico de batalha. Fundo quase preto, superfícies translúcidas, dourado como destaque, azul celeste como informação.
- **Modo:** escuro. O tema claro está planejado: `settingsStore.theme` já existe, e implementar é redefinir os tokens.
- **Tipografia:** Inter / system-ui. Nada de texto abaixo de 12px (`text-xs`). Títulos em peso 800–900, corpo em 400–600.
- **Ícones:** lucide-react (SVG). Nunca emoji como ícone.

## Cores

Sempre via token com modificador de opacidade (`bg-gilt/10`, `border-parchment/12`). O lint proíbe cor literal em utilitário simples.

| Papel | Token |
|---|---|
| Fundo | `cosmic`, `cosmic-soft`, `abyss` |
| Superfícies | `surface`, `surface-2`, `panel`, `ink` (+ opacidade) |
| Texto | `ivory` (principal), `ivory-soft`, `muted` |
| Linhas | `line`, `parchment/5–20` |
| Destaque primário | `gilt` (botões, foco, seleção), `gold` (texto de rótulo) |
| Informação | `azure`, `azure-100/200`, `cosmic-blue` |
| Sucesso / perigo | `success-*`, `danger-*` |

Tokens quase iguais (`gilt`/`gold`, `parchment`/`ivory`) existem porque é o que a UI pinta hoje. Unificar é decisão de design.

## Layout e toque

- Mobile-first. Breakpoints: `fold` 280, `xs` 375, `phone` 399, `sm` 600, `md` 760, `lg` 1024.
- **Tipos de tela suportados, cobertos pelo e2e no CI:** celular (375), celular deitado (740×360), dobrável fechado (280), tablet (768) e desktop (1280). Auditoria manual também em 320, 430, 820, 932×430, 1024, 1440, 1920 e 2560.
- **Tela de toque ≠ tela estreita:** use `pointer-coarse:` para tamanhos de toque (44px), não só `max-sm:`. Tablet e celular deitado são largos, mas continuam sendo de toque.
- **Duas colunas (conteúdo + lateral) só a partir de `lg`.** Em `md`, o card ficava espremido em ~340px.
- **Tela baixa (`short:` = altura ≤ 500px, celular deitado):** o header deixa de ser sticky (`short:static`), senão ocuparia ~1/3 da altura.
- **Grid com uma coluna:** use `grid-cols-1` (`minmax(0,1fr)`), nunca a trilha implícita `auto`, porque conteúdo `nowrap` (abas) estica o card além da tela.
- **Nada de `min-width` no `body`:** com ele, o celular de 280px renderizava a página com 320px e reduzia o zoom.
- Alvo de toque ≥ 44×44px (`h-11 w-11`) em controles interativos.
- Nada mais largo que a viewport. Barras roláveis (abas) rolam **dentro** do card.
- Header sticky e compacto. Nada de conteúdo por trás de elemento fixo.
- Modal/drawer: `Dialog` / `useDialogBehavior` de `@/shared/ui`.

## Movimento

Regras (skill ui-ux-pro-max §7):

- **Toda animação expressa causa e efeito** (algo abriu, entrou, mudou). Nada puramente decorativo, e no máximo 1–2 elementos animados por tela.
- Só `transform` e `opacity`. Nunca animar largura, altura ou posição de layout.
- **Entrada desacelera** (`ease.out`), **saída acelera** (`ease.in`). A saída dura ~60–70% da entrada.
- **Nada infinito**, exceto indicador de carregamento.
- **`prefers-reduced-motion` respeitado sempre**: `MotionConfig reducedMotion="user"` e a regra global do `index.css`.
- Animação nunca bloqueia input e sempre pode ser interrompida.

Tokens (`shared/ui/motion/tokens.ts`):

| Token | Valor | Uso |
|---|---|---|
| `duration.press` | 0.12s | feedback de toque |
| `duration.fast` | 0.18s | hover, dropdown, destaque |
| `duration.base` | 0.24s | entrada de diálogo/drawer, troca de conteúdo |
| `duration.exit` | 0.16s | saída (~65% da entrada) |
| `duration.slow` | 0.45s | barras de stats preenchendo (e o número contando junto) |
| `duration.flash` | 0.9s | destaque de "isto mudou", uma vez só |
| `ease.out` | `[0.22, 1, 0.36, 1]` | entradas |
| `ease.in` | `[0.4, 0, 1, 1]` | saídas |
| `stagger` | 0.04s | itens de lista entrando em sequência |
| `spring.snappy` | stiffness 420, damping 32 | escala de toque |
| `layoutTransition` | 0.24s, `ease.out` | vizinhos deslizando para o novo lugar (`layout`, `layoutId`) |
| `pop` | escala 1 → 1,25 → 1 em 0.3s | confirmação (favoritou, adicionou) |

Biblioteca: **Motion** (`motion`), só via `LazyMotion` + `m` (`motion/react-m`). O lint proíbe `motion.*` completo e `framer-motion`, para o bundle não inflar sem ninguém perceber.

Conferido contra a doc oficial ([motion.dev/docs](https://motion.dev/docs/react-reduce-bundle-size)):
- `m` + `LazyMotion` com `features` carregado por `import()` é o caminho recomendado para bundle mínimo. Usamos `domMax` (animate, exit, gestos, **layout e drag**): ~28 KB gzip num chunk que chega depois da primeira pintura. O bundle principal não muda (medido: +0,1 KB em relação ao `domAnimation`).
- `reducedMotion="user"` desliga transform e layout e mantém opacidade. É a recomendação de acessibilidade da doc: trocar movimento por fade.
- **Componente que o pai desmonta** (`{open && <X />}`) precisa estar dentro de `<AnimatePresence>` no pai, e o `AnimatePresence` interno com `propagate`, senão a saída não roda. O `Dialog` já usa `propagate`.
- **Layout (`layout`, `layoutId`):** todo container com `overflow-auto` que tenha elementos com layout dentro precisa de `layoutScroll`, senão a medição sai errada quando ele está rolado. Em conteúdo que não pode distorcer (texto dentro de um card que muda de altura), use `layout="position"`. Em listas que perdem itens, `AnimatePresence mode="popLayout"` com o pai `relative`. Várias barras com indicador `layoutId` ficam cada uma no seu `LayoutGroup id`.
- **Arrastar:** sempre por uma alça (`useDragControls` + `dragListener={false}`, `touch-action: none` só na alça), senão o dedo não rola mais a página no celular. E sempre com uma alternativa sem arrastar, com botões e teclado (WCAG 2.5.7). Grave no store só ao soltar.
- **Número contando:** use `useCountUp` (`shared/ui/motion`), que é `requestAnimationFrame` puro. Nunca o `animate()` imperativo nem `useSpring` do Motion no bundle principal: medidos, custam +12 KB e +5 KB gzip. O número animado fica `aria-hidden`, com o valor final em `sr-only` ao lado.
- Motion anima via estilo inline, que vence as classes do Tailwind. Não coloque `transition-all`/`transition-transform` em elemento cujo `transform` o Motion anima, porque a transição CSS "arrasta" cada quadro.

## Checklist antes de entregar UI

- [ ] Auditoria mobile limpa: toque ≥ 44px, texto ≥ 12px, sem overflow horizontal.
- [ ] Foco visível em todo controle, e Tab na ordem visual.
- [ ] Botão só de ícone tem `aria-label`.
- [ ] Funciona com reduced motion ligado (estado final aparece sem animar).
- [ ] Sem cor literal (lint) e sem import de biblioteca de animação fora do padrão.
