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
| `duration.slow` | 0.45s | barras de stats preenchendo |
| `ease.out` | `[0.22, 1, 0.36, 1]` | entradas |
| `ease.in` | `[0.4, 0, 1, 1]` | saídas |
| `stagger` | 0.04s | itens de lista entrando em sequência |
| `spring.snappy` | stiffness 420, damping 32 | escala de toque |

Biblioteca: **Motion** (`motion`), só via `LazyMotion` + `m` (`motion/react-m`). O lint proíbe `motion.*` completo e `framer-motion`, para o bundle não inflar sem ninguém perceber.

## Checklist antes de entregar UI

- [ ] Auditoria mobile limpa: toque ≥ 44px, texto ≥ 12px, sem overflow horizontal.
- [ ] Foco visível em todo controle, e Tab na ordem visual.
- [ ] Botão só de ícone tem `aria-label`.
- [ ] Funciona com reduced motion ligado (estado final aparece sem animar).
- [ ] Sem cor literal (lint) e sem import de biblioteca de animação fora do padrão.
