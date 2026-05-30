# Instruções do Projeto Archivum Arceus

## Contexto do Produto
- **Nome Oficial:** Archivum Arceus
- **Direção Visual:** Baseada em Arceus (Pokédex divina, arquivo cósmico, templo digital). Premium, elegante e tecnológico.

## Stack do Projeto
- **Framework:** React 19 + TypeScript + Vite
- **Estilização:** CSS Puro (sem Tailwind, não utilize Tailwind nem instale dependências de estilização adicionais).
- **Gerenciamento de Estado:** Zustand + IDB-Keyval / LocalForage para persistência
- **Data Fetching:** TanStack React Query (v5)
- **Roteamento:** Não identificada biblioteca de roteamento externa (SPA gerida por estado ou simples)
- **Ícones:** Lucide React

## Comandos Principais (na pasta arce-dex)
- Instalar dependências: `npm install`
- Rodar servidor dev: `npm run dev`
- Build de produção: `npm run build`
- Rodar linter: `npm run lint`
- Rodar testes: `npm run test`

## Regras de Desenvolvimento (Obrigatórias)

1. **Preservar Funcionalidades Existentes:** Nunca remova funcionalidades que já estão prontas (Team Builder, Favoritos, Busca, Filtros, Histórico) durante refatorações visuais.
2. **Respeitar a Stack:** Não altere a stack sem autorização explícita do usuário. Não substitua o CSS puro por Tailwind ou Styled Components. Mantenha a arquitetura atual.
3. **Preservar Zustand e TanStack Query:** A lógica de fetch da API e o gerenciamento de estado devem ser intocados nas alterações de UI.
4. **Alterações em Etapas Pequenas:** Faça alterações visuais incrementais e seguras. Nunca tente reescrever a página inteira de uma vez.
5. **Validação Rigorosa:** Sempre valide se a alteração funciona rodando `npm run build` (ou via testes locais) após as modificações.
6. **Reportar Mudanças:** Ao final de cada intervenção, cite os arquivos reais que foram alterados ou que precisarão ser alterados na próxima etapa.