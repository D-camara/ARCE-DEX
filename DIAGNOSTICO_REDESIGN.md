# DIAGNÓSTICO TÉCNICO COMPLETO - ARCE-DEX
## Pokédex Redesign com Open Design + Gemini 3.0 Pro

**Data**: 2026-05-29  
**Projeto**: Archivum Arceus (ARCE-DEX)  
**Status**: Pronto para Redesign  
**Versão**: 1.0

---

## 📋 Índice

1. [Stack Identificada](#1-stack-identificada)
2. [Estrutura Principal do Front-end](#2-estrutura-principal-do-front-end)
3. [Como o Open Design Está Funcionando](#3-como-o-open-design-está-funcionando)
4. [Agente/Modelo Recomendado](#4-agentmodelo-recomendado-para-redesign)
5. [Diagnóstico Visual Atual](#5-diagnóstico-visual-atual)
6. [Problemas Estruturais & Riscos](#6-problemas-estruturais--riscos)
7. [Plano de Redesign Recomendado](#7-plano-de-redesign-recomendado)
8. [Arquivos que Serão Alterados](#8-arquivos-que-serão-alterados)
9. [Prompt Ideal para Open Design](#9-prompt-ideal-para-mandar-ao-open-design)
10. [Próximas Ações](#10-próximas-ações-checklist)
11. [Riscos & Mitigações](#11-riscos--mitigações)

---

## 1. Stack Identificada

| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 19.2.6 | Framework principal |
| **TypeScript** | ~6.0.2 | Type safety |
| **Vite** | 8.0.12 | Build tool & dev server |
| **Zustand** | 5.0.13 | State management (global) |
| **TanStack Query** | 5.100.14 | API data fetching & caching |
| **Lucide React** | 1.16.0 | Icon library |
| **CSS Puro** | - | Styling (sem Tailwind/shadcn) |
| **idb-keyval** | 6.2.4 | IndexedDB wrapper (persistência) |
| **localforage** | 1.10.0 | Local storage abstraction |

### 🔴 Observação Crítica
Projeto usa **CSS puro com design tokens** (CSS custom properties) em lugar de Tailwind ou framework CSS. Isso oferece máxima flexibilidade visual mas requer refatoração manual no redesign.

---

## 2. Estrutura Principal do Front-end

```
arce-dex/src/
├── /app                          # Componente raiz & lógica central
│   ├── App.tsx                   # Shell principal (layout, roteamento, estado)
│   ├── appDataAdapters.ts        # Transformação de dados (PokeAPI → UI)
│   └── providers.tsx             # Context providers
│
├── /components                   # Componentes reutilizáveis
│   ├── /pokemon
│   │   ├── PokemonCard.tsx       # Card principal do Pokémon
│   │   ├── PokemonTabs.tsx       # Abas de conteúdo (Info, Moves, Evolutions)
│   │   ├── TypeBadges.tsx        # Badges de tipo
│   │   └── AbilityDetailsDialog.tsx
│   ├── /team
│   │   ├── AddToTeamDialog.tsx
│   │   ├── TeamLabAnalysis.tsx
│   │   ├── TeamPokemonEditor.tsx
│   │   └── TeamSlotCard.tsx
│   ├── /ui
│   │   └── StatusStates.tsx      # Loading, Error, Toast
│   └── /layout
│
├── /features                     # Módulos de feature maiores
│   ├── /pokemon-search
│   │   └── SearchExperience.tsx  # Busca com autocomplete
│   ├── /pokemon-detail           # Detalhes do Pokémon
│   ├── /team-builder
│   │   └── TeamLabView.tsx       # "Team Laboratory" - editor de times
│   ├── /type-calculator          # Análise de efetividade de tipo
│   ├── /favorites
│   │   ├── FavoritesDrawer.tsx   # Drawer lateral de favoritos
│   │   ├── FavoritesPanel.tsx
│   │   └── RecentPokemonPanel.tsx
│   └── /pokemon-detail
│
├── /hooks                        # Custom hooks para PokeAPI
│   ├── usePokemon.ts             # Fetch single pokemon
│   ├── usePokemonList.ts         # Fetch all pokemons
│   ├── useAbility.ts
│   ├── useEvolutionChain.ts
│   ├── useMovesDetails.ts
│   └── ...6 outros hooks
│
├── /services                     # API abstraction
│   ├── /pokeapi
│   │   ├── client.ts             # HTTP client
│   │   ├── endpoints.ts          # API routes
│   │   └── mappers.ts            # Response → Domain types
│   └── ...
│
├── /stores                       # Zustand stores (global state)
│   ├── favoritesStore.ts         # Favoritos
│   ├── teamStore.ts              # Times
│   ├── searchHistoryStore.ts     # Histórico de buscas
│   └── settingsStore.ts          # Configurações do app
│
├── /lib                          # Utilitários
│   ├── search/                   # Lógica de busca
│   ├── type-chart/               # Cálculos de efetividade
│   ├── stats/                    # Cálculos de stats
│   ├── hidden-power/             # Hidden Power calc
│   ├── items/                    # Item database
│   ├── storage/                  # Storage abstraction
│   └── utils/                    # Funções gerais
│
├── /types                        # TypeScript types
│   ├── pokemon.ts
│   ├── pokeapi.ts
│   └── team.ts
│
├── index.css                     # Reset + tipografia + vars CSS
├── App.css                       # DEPRECATED (arquivo vazio)
└── main.tsx                      # Entry point
```

### 📌 Observação Arquitetural

- **Layout 2-coluna**: primária (Pokemon) + secundária (Recent Pokemon)
- **Mobile**: stacked layout com action strip
- **Desktop (760px+)**: side panel
- **Drawer modal**: para Favoritos
- **Modal**: para Team Lab

---

## 3. Como o Open Design Está Funcionando

### ⚠️ Situação Atual

**Não há Open Design instalado/configurado neste projeto ainda.**

### Evidências

- ✗ Sem arquivo `.instructions.md` ou `.prompt.md`
- ✗ Sem arquivo `DESIGN.md` ou `CLAUDE.md`
- ✗ Sem skill de design registrada
- ✗ Sem configuração de design system versionado
- ✗ Sem integração com Gemini 3.0 Pro

### O que Precisa Ser Criado

1. Arquivo `.instructions.md` ou `CLAUDE.md` para guardar design guidelines
2. Definição de design system com paleta, tipografia, spacing
3. Prompt template para o Open Design com regras de estilo
4. Possível integração com skill customizado do Open Design

---

## 4. Agente/Modelo Recomendado para Redesign

| Opção | Recomendação | Por quê |
|---|---|---|
| **Gemini 3.0 Pro** | ⭐ Recomendado | Excelente para design visual, análise de UI/UX, geração de layouts |
| **Claude 4.7** (Opus) | ✓ Bom | Muito capaz, bom para code + design, mas menos focado em visual |
| **Open Design CLI** | ⚠️ Verificar | Precisa validar integração com seu setup |

### Fluxo Proposto

```
Você → (descrição visual + briefing) → Gemini 3.0 Pro + Open Design
         ↓
    Análise de design → Mockups/componentes em Figma/código
         ↓
    Feedback → Refinamento iterativo
         ↓
    Implementação final no projeto
```

---

## 5. Diagnóstico Visual Atual

### 5.1 O que está **BOM** 🟢

| Aspecto | Feedback |
|---|---|
| **Tema coerente** | Dark mode bem executado com paleta azul + laranja |
| **Hierarquia visual** | Títulos, labels e conteúdo bem diferenciados |
| **Espaçamento** | Margem e padding consistentes (8px, 10px, 12px, 14px, 16px) |
| **Interatividade** | Feedback visual em hovers, focus states funcionam |
| **Cards atraentes** | Bordas, shadows e backdrop blur criam profundidade |
| **Tipografia** | Inter com sizes bem definidos (clamp() para responsive) |
| **Mobilidade** | Responsive até 320px com bom layout adaptativo |
| **Acessibilidade** | `.sr-only` classes, alt texts em imagens, focus states |
| **Ícones** | Lucide React bem integrado, tamanhos apropriados |

### 5.2 O que pode **MELHORAR** 🟡

| Aspecto | Problema | Impacto | Severidade |
|---|---|---|---|
| **Identidade Pokémon fraca** | Design genérico, sem conexão com marca Pokémon | UX | 🟠 Alta |
| **Cards muito minimalistas** | Sem hover effects elegantes, sem gradientes | Visual | 🟠 Alta |
| **Tipografia corporativa** | Inter é genérica; Pokémon tem fonts próprios | Branding | 🟡 Média |
| **Paleta limitada** | Azul + laranja, sem cores secundárias Pokémon | Visual | 🟠 Alta |
| **Falta de animações** | Zero micro-interactions, transições lentas | Feel | 🟡 Média |
| **Team Lab pouco intuitivo** | UI é funcional mas confusa para novo usuário | UX | 🟠 Alta |
| **Badges e tipos genéricos** | Sim tem cores, mas sem visual distinctive | Visual | 🟡 Média |
| **Loading states básicos** | Shimmer animation é a única feedback de loading | UX | 🟡 Média |
| **Drawer favoritos esconde conteúdo** | Overlay full-height prejudica navigation | UX | 🟡 Média |
| **Contraste alguns textos** | Alguns grays ficam muito frios/cinzentos | A11y | 🟡 Média |

### 5.3 Detalhamento por Página

#### **Página Principal (Dex)**
- ✅ Search top bar bem posicionada, sticky
- ⚠️ Card principal do Pokémon é muito simples
- ⚠️ Stats bar lacks visual distinction
- ⚠️ Abas (Info/Moves/Evolutions) pouco diferenciadas
- ✅ Recent Pokemon panel útil
- ❌ Sem animação de entrada/saída

#### **Team Lab**
- ✅ Grid de 6 slots (correto para times Pokémon)
- ⚠️ UI muito técnica, parece spreadsheet
- ⚠️ Editor de moves/stats muito denso
- ❌ Falta visual drag-drop feedback
- ❌ Sem análise visual do time (deficits de cobertura)

#### **Favoritos (Drawer)**
- ✅ Drawer lateral é bom padrão
- ⚠️ Sem categorização (recent vs favoritos misturados?)
- ⚠️ Cards muito simples com gradient
- ❌ Sem animação de slide-in

---

## 6. Problemas Estruturais & Riscos

| Problema | Local | Risco | Ação |
|---|---|---|---|
| CSS monolítico 2.3KB | `/src/index.css` e `/src/App.css` | Refatoração manual futura é difícil | Dividir em arquivos CSS modulares durante redesign |
| Componentes acoplados ao CSS | Todos os components | Mudança de classe quebra UI | Mapear classe → componente antes de redesign |
| Sem design tokens exportáveis | CSS custom properties apenas | Impossível sincronizar design ↔ code | Criar JSON ou TypeScript de design tokens |
| Queries media hardcoded | CSS | Breakpoints espalhados | Consolidar em arquivo central |
| Sem sistema de componentes UI | Somente 3 componentes genéricos | Difícil escalar design | Criar design system próprio (ou shadcn) |

---

## 7. Plano de Redesign Recomendado

### 7.1 Conceito Visual

**Nome**: "Pokédex Pro" / "Archivum Arceus Premium"

**Direção**: 
- **Energético + Profissional**: Manter dark mode, mas adicionar cores vivas Pokémon
- **Moderno + Iconic**: Referência ao design de jogos Pokémon modernos (SWSH, SV)
- **Acessível + Intuitivo**: Melhorar navegação, adicionar microcopy, feedback visual

### 7.2 Design System Sugerido

#### **Paleta de Cores**

**Cores Primárias Pokémon**:
```css
--pokemon-red:      #DC143C  (usado em Fire types, vermelho vibrante)
--pokemon-blue:     #4B90E2  (Water types)
--pokemon-yellow:   #FFD700  (Electric types)
--pokemon-green:    #4CAF50  (Grass types)
--pokemon-purple:   #9C27B0  (Psychic/Ghost types)
```

**Cores Neutras (Dark theme)**:
```css
--bg-dark:         #0B0E11  (mais escuro que atual)
--surface-1:       #141B24  (cards)
--surface-2:       #1F2937  (elevated)
--text-primary:    #F0F4F8  (mais claro)
--text-secondary:  #9CA3AF  (mantém gray)
--text-muted:      #6B7280  (mais claro que atual)
--accent:          #00BCD4  (cyan, mais energético)
--accent-alt:      #FF6B6B  (pinkish, vibrante)
```

**Shadows/Depth** (melhorado):
```css
--shadow-sm:   0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-md:   0 10px 15px rgba(0, 0, 0, 0.2);
--shadow-lg:   0 20px 40px rgba(0, 0, 0, 0.3);
--shadow-glow: 0 0 20px rgba(0, 188, 212, 0.3); /* glow effect */
```

#### **Tipografia**

```
Headings (H1-H3):  
  - Font: "Segoe UI" / "SF Pro Display" (system fonts mais premium)
  - Weight: 700-900
  - Line-height: 1.1-1.2
  
Body Text:
  - Font: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
  - Size: 14-16px
  - Weight: 400-600

Code/Monospace:
  - Font: "Fira Code" ou "JetBrains Mono"
  - Para stats e EVs
```

#### **Spacing Scale**

```
--space-1:  4px   (micro)
--space-2:  8px   (compact)
--space-3: 12px   (normal)
--space-4: 16px   (standard)
--space-5: 24px   (large)
--space-6: 32px   (section)
--space-7: 48px   (hero)
```

#### **Radius Scale**

```
--radius-sm:  8px    (buttons, inputs)
--radius-md: 12px    (cards)
--radius-lg: 16px    (modals)
--radius-xl: 24px    (hero sections)
--radius-full: 999px (pills, full round)
```

### 7.3 Componentes Redesenhados

#### **1. Search Bar**
- **Antes**: Simples input com border
- **Depois**: 
  - Ícone de busca animado
  - Suggestion dropdown com **imagem + tipos + número**
  - Glow effect no focus
  - Keyboard shortcuts mostrados

#### **2. Pokémon Card Principal**
- **Antes**: Layout 2-colunas simples
- **Depois**:
  - **Hero image com parallax** (sprite maior, background gradient)
  - **Type badges redimensionados** (icons + text, mais visuais)
  - **Stats com visual bars** (animadas ao carregar)
  - **Ability cards elegantes** (com descrição hover)
  - **Action buttons sticky** (floating, sempre acessíveis)

#### **3. Tabs de Conteúdo**
- **Antes**: Botões básicos
- **Depois**:
  - **Tab bar animada** (underline slide)
  - **Content fade transitions**
  - **Subcategorias** (ex: Moves divididas por método: Level-up, TM, etc)

#### **4. Team Lab - Slot Editor**
- **Antes**: Spreadsheet-like
- **Depois**:
  - **Card-based layout** (cada Pokémon em card elegante)
  - **Visual preview** (imagem, tipos, abilities)
  - **Drag-drop interface** (reordenar times)
  - **Coverage analysis visual** (ícones de tipo mostrando cobertura)
  - **Speed radar** (comparação visual de speed tiers)

#### **5. Favorites Drawer**
- **Antes**: Drawer lateral simples
- **Depois**:
  - **Tabs**: Recent vs Favorites
  - **Visual grid** (2-3 colunas em desktop)
  - **Slide-in animation** (suave, com backdrop blur)
  - **Quick actions** (favorite/unfavorite inline)

---

## 8. Arquivos que Serão Alterados

| Arquivo | Motivo | Risco | Prioridade |
|---|---|---|---|
| **src/index.css** | Refatorar design tokens, adicionar novas cores/spacing | 🔴 Alto | 1 |
| **src/App.css** | Consolidar em index.css, remover duplicatas | 🟡 Médio | 1 |
| **src/components/pokemon/PokemonCard.tsx** | Novo layout, animações | 🟡 Médio | 1 |
| **src/components/pokemon/PokemonTabs.tsx** | Tab animation, melhor estrutura | 🟡 Médio | 2 |
| **src/components/pokemon/TypeBadges.tsx** | Redesenho visual completo | 🟢 Baixo | 2 |
| **src/features/pokemon-search/SearchExperience.tsx** | Dropdown visual melhorado | 🟡 Médio | 2 |
| **src/features/team-builder/TeamLabView.tsx** | Redesenho completo (drag-drop, cards) | 🔴 Alto | 1 |
| **src/features/team-builder/TeamSlotCard.tsx** | Nova card design | 🟡 Médio | 1 |
| **src/features/favorites/FavoritesDrawer.tsx** | Layout em tabs, animações | 🟡 Médio | 2 |
| **src/components/ui/StatusStates.tsx** | Melhorar loading/error visuals | 🟢 Baixo | 3 |
| **src/app/App.tsx** | Pode precisar ajustes de layout | 🟢 Baixo | 3 |

### Sumário de Risco

🟠 **Risco total: Médio-Alto** (requer refatoração CSS e componentes React)

---

## 9. Prompt Ideal para Mandar ao Open Design

```markdown
# REDESIGN DA POKÉDEX - ARCHIVUM ARCEUS PREMIUM

## Brief Visual

Transformar a Pokédex de um design genérico dark-mode em uma **interface premium, energética e intuitiva** inspirada nos jogos Pokémon modernos (Sword/Shield, Legends Arceus, Scarlet/Violet).

## Contexto do Projeto

- **App**: Pokédex com busca, detalhes de Pokémon, Team Builder
- **Stack**: React 19 + TypeScript + Vite + CSS Puro
- **Tema**: Dark mode com acentos coloridos
- **Público**: Treinadores competitivos e casual players
- **Dispositivos**: Mobile-first (320px+), tablet (760px+), desktop (1024px+)

## Direcionais de Design

### Estética
- ✅ Manter dark theme (profissional + moderno)
- ✅ Adicionar cores vibrantes Pokémon (red, blue, yellow, green, purple)
- ✅ Elevar tipografia (mais premium)
- ✅ Adicionar profundidade (shadows, glows, layering)
- ✅ Incorporar micro-animações (transições suaves, hovers elegantes)

### UX
- ✅ Melhorar navigation clarity
- ✅ Adicionar visual feedback em todas interações
- ✅ Team Lab deve ser intuitivo (não parecer spreadsheet)
- ✅ Favorites drawer melhor organizada
- ✅ Search deve ser destaque (hero section)

### Brand
- ✅ Referência visual aos jogos Pokémon (sem copiar direto)
- ✅ Usar palette oficial de tipos Pokémon
- ✅ Spritesheet Pokémon em destaque (maior, com parallax)
- ✅ Badges de tipo com ícones + cores

## Elementos a Redesenhar

### 1. Search Bar (Top Header)
**Antes**: Input simples
**Depois**: Hero search com:
- Ícone animado
- Suggestion dropdown rich (imagem, tipos, dex number)
- Glow effect ao focar
- Keyboard shortcuts visíveis

### 2. Pokémon Card Principal
**Antes**: Layout minimalista
**Depois**: Card elegante com:
- Sprite em destaque (parallax, maior)
- Gradient background por tipo primário
- Type badges visuais (icons + text)
- Stats bar com animações
- Ability cards interativos
- Ação buttons flutuantes (sticky)

### 3. Abas de Conteúdo (Info/Moves/Evolutions)
**Antes**: Tabs básicos
**Depois**: Tab bar animada com:
- Underline slide animation
- Content fade transitions
- Subcategorias de moves (Level-up, TM, Tutor, etc)

### 4. Team Lab (Team Builder)
**Antes**: Editor de spreadsheet
**Depois**: Interface elegante com:
- Cards por Pokémon (imagem, tipos, abilities)
- Drag-drop para reordenar
- Coverage analysis visual (ícones mostrando type coverage)
- Speed rank comparison visual
- Stats editor polido

### 5. Favorites Drawer
**Antes**: Drawer simples
**Depois**: Modal elegante com:
- Tabs: Recent vs Favorites
- Grid visual (2-3 colunas em desktop)
- Smooth slide-in animation
- Quick actions (favorite/remove inline)

## Design System a Criar

### Paleta
- **Dark BG**: #0B0E11 (mais profundo)
- **Surface**: #141B24, #1F2937, #2A3F5F (3 níveis)
- **Primário**: #00BCD4 (cyan vibrante)
- **Secundário**: #FF6B6B (pink/red energético)
- **Pokémon types**: Red (#DC143C), Blue (#4B90E2), Yellow (#FFD700), etc

### Tipografia
- H1-H3: Segoe UI / SF Pro Display, weight 700-900
- Body: System sans-serif, 14-16px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px
- Radius: 8, 12, 16, 24, 999px

### Componentes
- Cards com border subtle + shadow
- Buttons com hover glow
- Badges com icon + background
- Animations: transitions 150-300ms
- Dark theme com good contrast (WCAG AA+)

## Entregáveis Esperados

1. **Visual direction** (mockups ou protótipo)
2. **Component library** (design tokens exportáveis)
3. **CSS/código pronto** (para integrar no projeto React)
4. **Guia de implementação** (step-by-step dos componentes)
5. **Responsive breakpoints** (mobile, tablet, desktop)

## Restrições

- ✅ Manter todas funcionalidades existentes
- ✅ Não remover features (apenas melhorar visual)
- ✅ Compatível com React 19 + TypeScript
- ✅ CSS Modules ou CSS Puro (sem Tailwind)
- ✅ Accessible (WCAG AA+)
- ✅ Performance: sem libs CSS-in-JS pesadas

## Tom & Vibe

Imagina a interface como um **personal assistant de treinador Pokémon**: profissional, inteligente, energético mas sem ser agressivo. Polido como um app premium, mas acessível a casual players.

Referências visuais: 
- Pokémon Scarlet/Violet UI
- Pokémon Legends Arceus aesthetic
- Dribbble "dark mode pokemon" (mais moderno que atual)
- Apple Health app (polished, data visualization)
```

---

## 10. Próximas Ações (Checklist)

- [ ] **Fase 1: Validação** — Mandar brief acima para Gemini 3.0 Pro via Open Design
- [ ] **Fase 2: Design** — Receber mockups/prototype em Figma ou código
- [ ] **Fase 3: CSS Design Tokens** — Extrair colors, spacing, typography
- [ ] **Fase 4: Componentes React** — Refatorar PokemonCard, Tabs, TeamLab, etc
- [ ] **Fase 5: Testes** — Validar responsividade, acessibilidade, performance
- [ ] **Fase 6: Deploy** — Build, test, merge to main

---

## 11. Riscos & Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Refatoração CSS quebrar layout | Alto | Versionar CSS.bak, testar breakpoints |
| Animações degradarem performance | Médio | Usar `will-change`, `transform`, `opacity` only |
| Novo design não agradar stakeholders | Alto | Validar mockup antes de implementar |
| Incompatibilidade com browsers antigos | Baixo | Testar em Chrome, Firefox, Safari, Edge |
| Perda de dados durante refatoração | Crítico | Versionar tudo em git, criar branch separada |

---

## 🎯 Conclusão

**Status**: ✅ Pronto para começar redesign com Gemini 3.0 Pro

O projeto está bem estruturado e pronto para um redesign completo. A análise acima fornece:

1. ✅ Compreensão completa da stack e arquitetura
2. ✅ Diagnóstico visual detalhado dos problemas
3. ✅ Design system proposto coeso
4. ✅ Plano de implementação claro
5. ✅ Prompt pronto para IA/Open Design

**Próximo passo**: Mandar o brief para Gemini 3.0 Pro e começar iterações de design visual.

---

**Preparado por**: Claude Code  
**Data**: 2026-05-29  
**Versão**: 1.0
