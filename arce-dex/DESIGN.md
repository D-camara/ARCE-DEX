# Archivum Arceus - Design System

## Conceito Visual
**Pokédex Divina, Arquivo Cósmico, Templo Digital**

A identidade visual do *Archivum Arceus* afasta-se do design infantil tradicional e busca uma estética premium, elegante, mística e tecnológica. Inspirada em Arceus (a divindade criadora), o visual mistura luz, o cosmos, registros ancestrais e interfaces de alta precisão.

## Princípios Visuais do Produto
1. **Premium e Restrito:** Menos ruído, mais foco. Sombras projetadas com suavidade, glows controlados e cores contidas.
2. **Contraste Cósmico:** Fundo escuro imersivo (preto profundo e azul muito escuro) com textos e destaques luminosos.
3. **Magia Tecnológica:** O misticismo de Arceus deve parecer algo catalogado cientificamente. Modais com vidro translúcido (glassmorphism leve), bordas quase imperceptíveis e brilhos pontuais.

## Paleta de Cores (Inspirada em Arceus)
- **Preto Profundo / Cinza Cósmico:** O vazio do espaço (background principal e surfaces de contraste).
- **Marfim / Branco Luminoso:** A pureza da luz da criação (textos principais e ícones importantes).
- **Dourado (Accent Gold):** O anel de Arceus (status, botões primários e chamadas para ação).
- **Azul Etéreo & Roxo Espacial:** Energias místicas (glows, badges e estados secundários).

## Tokens Visuais Recomendados
Estes tokens devem ser usados exclusivamente. Verifique o `src/index.css` para as implementações em código.
- `--bg`: Preto profundo cósmico
- `--surface`, `--surface-2`, `--surface-3`: Níveis de elevação e separação (mais claro à medida que se aproxima do usuário)
- `--accent-gold`, `--accent-ivory`, `--accent-cosmic-blue`, `--accent-astral-purple`
- `--glow-gold`, `--glow-blue`, `--glow-purple` (box-shadow para emissões de luz)

## Regras de Componentes

### Tipografia
- **Família:** `Inter` ou sistema (sans-serif moderno e limpo).
- **Pesos:** Light/Regular para leitura longa, Medium/Semi-bold para títulos limpos. Não abusar do peso Black para manter a elegância.
- **Hierarquia:** Títulos de Pokémon e seções em tamanhos maiores (24px a 48px), texto descritivo menor e de alto contraste (14px a 16px).

### Espaçamento
- Sistema baseado em 4px/8px.
- Áreas de respiração generosas, especialmente ao redor de imagens hero de Pokémon. `gap-4` e `gap-8` são comuns.

### Cards
- Fundo semitransparente ou surface escura plana.
- Bordas de 1px com cor `rgba(246, 237, 211, 0.15)` (Marfim em baixa opacidade) ou `rgba(255, 255, 255, 0.1)`.
- **Hover:** Adicionar um glow suave (`--glow-gold` ou da cor do tipo do Pokémon).
- Border-radius padrão: `16px` (`--radius-card`).

### Botões
- **Primário:** Fundo Surface com borda `accent-gold` ou preenchimento `accent-gold` e texto escuro.
- **Secundário:** Fundo translúcido, hover com glow.
- Border-radius: `12px` (`--radius-control`).

### Inputs / Search
- Fundo muito escuro (`--bg` ou `--surface-3`), sem borda rígida, apenas uma linha sutil abaixo ou ring (box-shadow) sutil de focus.
- Ícone de busca integrado elegantemente em Marfim.

### Badges de Tipo Pokémon
- As cores de tipo são canônicas, mas devem ser adaptadas ao tema escuro. Usar a cor de tipo como background, um leve glow e texto branco ou preto (dependendo do contraste do tipo).

### Modais, Drawers e Tabs
- Fundo em `--surface-2` com backdrop filter de blur (caso suporte sem perda de performance).
- Sombra projetada densa e focada (`--shadow`).

### Animação e Microinterações
- `transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);` para a maioria dos elementos interagíveis (cards, botões).
- Surgimento (fade-in) suave e revelações de conteúdo para dar sensação mística e imersiva.

### Responsividade
- O layout deve fluir como água. Em mobile (até 600px), a visualização assume um formato compacto de rolagem.
- Para desktop, usar `grid-template-columns` para organizar os detalhes do Pokémon.

### Acessibilidade
- O contraste de cor entre o background e os textos (branco/marfim) deve passar nos requisitos WCAG AA ou superior.
- Elementos fáceis de tocar/clicar (mínimo de 44px de altura hit-target em mobile).

### Propriedade Intelectual (Aviso)
- Não copie layouts de Pokédex oficiais.
- Não use assets restritos de interface (logos de jogos, etc.)
- Trate o visual como uma "aplicação sci-fi independente" de visual premium que, coincidentemente, analisa os dados de Pokémon.