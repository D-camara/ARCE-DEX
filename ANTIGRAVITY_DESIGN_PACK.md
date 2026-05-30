# ANTIGRAVITY DESIGN PACK — Archivum Arceus

## Referências locais

As skills de design estão disponíveis na raiz do workspace:

- ../.od-skills/design-review-bcd263d73
- ../.od-skills/frontend-design-469503eb07
- ../.od-skills/stitch-loop-b28925bc4
- ../.od-skills/color-expert-f7a7db63c7
- ../.od-skills/web-design-guidelines-878513fb0
- ../.od-skills/agent-browser-adcf0db3a
- ../.od-skills/full-page-screenshot-db4fac51c9

Use essas pastas como referência conceitual, não como código para copiar cegamente.

## Produto

O projeto se chama Archivum Arceus.

É uma Pokédex premium inspirada no Arceus.

A experiência deve parecer:

- Pokédex divina;
- arquivo cósmico;
- laboratório de catalogação Pokémon;
- interface premium;
- produto real, não dashboard genérico.

## Problema atual

A tela da Pokédex/detalhes ainda tem problemas visuais reais:

- topbar com “Meu Time” e “Favoritos” sobrepostos;
- topbar/sticky cobrindo conteúdo durante scroll;
- muito espaço vazio preto no lado direito;
- lista de recentes isolada;
- PokemonCard e PokemonTabs desconectados;
- botão “Adicionar à equipe” podendo ficar cortado;
- FavoritesDrawer cobrindo a tela de forma pouco elegante.

## Regras anti AI-slop

Não resolver design apenas com:

- glow;
- glassmorphism;
- gradiente;
- blur;
- sombras;
- bordas arredondadas;
- texto dizendo “premium” sem mudar composição.

Uma melhoria só é válida se melhorar pelo menos uma destas coisas:

- composição;
- hierarquia;
- uso de espaço;
- agrupamento de informação;
- responsividade;
- usabilidade;
- consistência visual.

## Direção visual

Use uma mistura controlada de:

- Totality Festival;
- Cosmic;
- Luxury;
- Bento;
- Premium;
- Glassmorphism;
- Fantasy.

Tradução prática:

- fundo preto obsidiana;
- textos em marfim;
- dourado para ênfase divina;
- azul etéreo para dados;
- roxo astral para profundidade;
- painéis em bento/grid;
- componentes com função clara;
- menos enfeite gratuito;
- mais estrutura e intenção.

## Regras técnicas

Stack:

- React
- TypeScript
- Vite
- CSS puro
- Zustand
- TanStack Query
- PokeAPI

Pode alterar:

- src/app/App.tsx
- src/components/pokemon/PokemonCard.tsx
- src/components/pokemon/PokemonTabs.tsx
- src/features/favorites/FavoritesDrawer.tsx
- src/index.css

Não alterar:

- Zustand stores
- teamStore
- TanStack Query
- PokeAPI services
- persistência
- lógica de busca
- lógica de favoritos
- lógica de adicionar à equipe
- cálculos
- contratos de dados

## Objetivo da tela Pokédex

A tela de detalhes deve parecer uma área única chamada:

Registro do Pokémon

Ela deve integrar:

- card principal;
- imagem/sprite;
- stats;
- ações;
- abas;
- recentes;
- favoritos/drawer.

## Correções obrigatórias

1. Topbar
- Separar “Meu Time” e “Favoritos”.
- Impedir sobreposição.
- Garantir responsividade.
- Garantir que sticky/fixed não cubra conteúdo.

2. Layout
- Reduzir espaço vazio lateral.
- Criar grid equilibrado.
- Integrar coluna principal e painel lateral.

3. PokemonCard + PokemonTabs
- Devem parecer uma única experiência.
- Reduzir distância entre eles.
- Tabs não podem parecer bloco solto.

4. Ações
- “Adicionar à equipe” precisa ficar visível.
- Botões não podem ser cortados.

5. Recentes
- Deve ser painel lateral integrado.
- Deve ter altura controlada.
- Pode ter scroll interno.

6. FavoritesDrawer
- Deve ter backdrop.
- Deve ter z-index correto.
- Desktop: painel lateral premium.
- Mobile: tela inteira ou quase inteira.
- Botão fechar sempre visível.

## Método de trabalho

Antes de alterar:

1. Inspecionar os arquivos.
2. Identificar estrutura real do layout.
3. Corrigir primeiro bugs visuais.
4. Só depois polir.

Depois de alterar:

1. Rodar npm run build.
2. Validar visualmente.
3. Revisar responsividade.
4. Reportar arquivos alterados.

## Critério de aceite

A tela só está aprovada se:

- “Meu Time” e “Favoritos” não se sobrepõem;
- a topbar não cobre conteúdo;
- não há espaço lateral morto exagerado;
- PokemonCard e PokemonTabs parecem conectados;
- “Adicionar à equipe” fica visível;
- Recentes parece parte da composição;
- FavoritesDrawer abre corretamente;
- mobile não tem scroll horizontal;
- build passa.