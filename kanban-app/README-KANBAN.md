# Kanban Board - Angular Frontend

Esta é uma aplicação frontend Angular para controle de Kanban, que consome uma API GraphQL desenvolvida em NestJS.

## Funcionalidades

- ✅ **Gerenciamento de Boards**: Criar, editar, visualizar e excluir quadros
- ✅ **Gerenciamento de Colunas**: Adicionar, editar e excluir colunas em cada board
- ✅ **Gerenciamento de Cards**: Criar, editar, visualizar e excluir cards em cada coluna
- ✅ **Drag & Drop**: Mover cards entre colunas e reordenar cards dentro da mesma coluna
- ✅ **Interface Responsiva**: Design moderno e responsivo
- ✅ **Integração GraphQL**: Comunicação eficiente com a API backend

## Tecnologias Utilizadas

- **Angular 20**: Framework principal
- **Apollo Angular**: Cliente GraphQL
- **Angular CDK**: Para funcionalidades de drag & drop
- **TypeScript**: Linguagem de programação
- **SCSS**: Estilização avançada

## Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── board/                 # Componente principal do kanban
│   │   └── board-list/            # Lista de boards
│   ├── graphql/
│   │   ├── graphql.module.ts      # Configuração Apollo
│   │   └── queries.ts             # Queries e mutations GraphQL
│   ├── models/
│   │   └── board.model.ts         # Interfaces TypeScript
│   └── services/
│       └── kanban.service.ts      # Serviço para API calls
```

## Pré-requisitos

1. **Node.js** (versão 18+)
2. **Angular CLI** (`npm install -g @angular/cli`)
3. **API Backend** rodando em `http://localhost:3000/graphql`

## Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar a aplicação:**
   ```bash
   npm start
   ```

3. **Acessar a aplicação:**
   - Abra o navegador em `http://localhost:4200`

## API GraphQL

A aplicação espera que a API backend esteja rodando em `http://localhost:3000/graphql` com o seguinte schema:

### Tipos

```graphql
type Board {
  id: ID!
  name: String!
  columns: [Column!]
}

type Column {
  id: ID!
  title: String!
  order: Float
  board: Board!
  cards: [Card!]
}

type Card {
  id: ID!
  title: String!
  description: String
  order: Float
  column: Column!
}
```

### Operações Suportadas

**Queries:**
- `boards`: Lista todos os boards
- `board(id: Int!)`: Busca um board específico com suas colunas e cards
- `columns`: Lista todas as colunas
- `cards`: Lista todos os cards

**Mutations:**
- `createBoard(name: String!)`: Cria um novo board
- `updateBoard(id: Int!, name: String!)`: Atualiza um board
- `deleteBoard(id: Int!)`: Exclui um board
- `createColumn(boardId: Int!, title: String!)`: Cria uma nova coluna
- `updateColumn(id: Int!, title: String!)`: Atualiza uma coluna
- `deleteColumn(id: Int!)`: Exclui uma coluna
- `createCard(columnId: Int!, title: String!, description: String!, order: Int)`: Cria um novo card
- `updateCard(id: Int!, title: String!, description: String!, columnId: Int!)`: Atualiza um card
- `deleteCard(id: Int!)`: Exclui um card
- `moveCard(id: Int!, columnId: Int!)`: Move um card para outra coluna
- `reorderCard(id: Int!, newIndex: Int!)`: Reordena um card

## Como Usar

### 1. Tela Principal (Lista de Boards)
- Visualize todos os seus boards
- Clique em "Criar Novo Quadro" para adicionar um board
- Clique no ícone de edição (✏️) para renomear um board
- Clique no ícone de lixeira (🗑️) para excluir um board
- Clique em "Abrir Quadro" para visualizar o kanban

### 2. Tela do Board (Kanban)
- **Adicionar Coluna**: Clique em "Adicionar Coluna" no cabeçalho
- **Editar Coluna**: Duplo clique no título da coluna para editar
- **Adicionar Card**: Clique no botão "+" no cabeçalho da coluna
- **Editar Card**: Duplo clique no card para editar título e descrição
- **Mover Cards**: Arraste e solte cards entre colunas ou reordene na mesma coluna
- **Excluir**: Use os ícones de lixeira para excluir colunas ou cards

## Boas Práticas Implementadas

### Arquitetura
- **Componentes Standalone**: Utilizando a nova arquitetura standalone do Angular
- **Lazy Loading**: Componentes carregados sob demanda
- **Separation of Concerns**: Separação clara entre componentes, serviços e modelos
- **Reactive Programming**: Uso de RxJS para gerenciamento de estado assíncrono

### TypeScript
- **Interfaces Tipadas**: Modelos bem definidos para Board, Column e Card
- **Strict Type Checking**: Tipagem rigorosa em toda a aplicação
- **Generic Types**: Uso de genéricos para operações GraphQL

### GraphQL
- **Query Optimization**: Busca apenas os campos necessários
- **Cache Management**: Cache inteligente com Apollo Client
- **Error Handling**: Tratamento adequado de erros de API
- **Optimistic Updates**: Atualizações otimistas para melhor UX

### UI/UX
- **Design Responsivo**: Funciona bem em desktop e mobile
- **Feedback Visual**: Loading states e feedback de ações
- **Drag & Drop Intuitivo**: Interações naturais para movimentação de cards
- **Confirmações**: Confirmações para ações destrutivas

### Performance
- **OnPush Change Detection**: Otimização de detecção de mudanças
- **TrackBy Functions**: Otimização de renderização de listas
- **Lazy Loading**: Carregamento sob demanda de componentes

## Scripts Disponíveis

- `npm start`: Executa a aplicação em modo de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run watch`: Executa em modo watch para desenvolvimento
- `npm test`: Executa os testes unitários

## Estrutura de Dados

A aplicação trabalha com uma estrutura hierárquica:

```
Board (Quadro)
└── Column (Coluna)
    └── Card (Card)
```

- Cada **Board** pode ter múltiplas **Columns**
- Cada **Column** pode ter múltiplos **Cards**
- Cards podem ser movidos entre colunas
- Cards e colunas podem ser reordenados

## Customização

### Estilos
- Arquivo principal: `src/styles.scss`
- Estilos dos componentes em seus respectivos `.scss`
- Variáveis CSS customizáveis para cores e espaçamentos

### Configuração GraphQL
- Endpoint configurável em `src/app/app.config.ts`
- Políticas de cache personalizáveis
- Configurações de erro customizáveis

---

**Desenvolvido com ❤️ usando Angular e as melhores práticas de desenvolvimento frontend**
