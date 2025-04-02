# Backend do Kanban Board

Este é o backend do Kanban Board, construído com Node.js, Express, GraphQL e Firebase.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Firebase
- Credenciais do Firebase Admin SDK

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com suas credenciais do Firebase

4. Para obter as credenciais do Firebase:
   - Acesse o [Console do Firebase](https://console.firebase.google.com)
   - Selecione seu projeto
   - Vá para Configurações do Projeto > Contas de serviço
   - Clique em "Gerar nova chave privada"
   - Use os valores do arquivo JSON gerado para preencher o `.env`

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor GraphQL estará disponível em `http://localhost:4000/graphql`

## Build

Para criar a build de produção:

```bash
npm run build
```

## Produção

Para iniciar o servidor em produção:

```bash
npm start
```

## Estrutura do Projeto

```
src/
├── config/         # Configurações (Firebase, etc.)
├── models/         # Modelos de dados
├── resolvers/      # Resolvers GraphQL
├── services/       # Serviços de negócio
├── types/          # Tipos TypeScript/GraphQL
└── index.ts        # Ponto de entrada
```

## Autenticação

O backend usa autenticação via Firebase. Todas as requisições devem incluir um token JWT válido no header:

```
Authorization: Bearer <seu-token>
```

## GraphQL Schema

O schema GraphQL inclui as seguintes operações principais:

### Queries
- `board(id: ID!): Board`
- `boards: [Board!]!`

### Mutations
- `createBoard(input: BoardInput!): Board`
- `updateBoard(id: ID!, input: BoardInput!): Board`
- `deleteBoard(id: ID!): Boolean`
- `addColumn(boardId: ID!, input: ColumnInput!): Column`
- `updateColumn(boardId: ID!, column: Column!): Column`
- `deleteColumn(boardId: ID!, columnId: ID!): Boolean`
- `addCard(boardId: ID!, columnId: ID!, input: CardInput!): Card`
- `updateCard(boardId: ID!, columnId: ID!, card: Card!): Card`
- `deleteCard(boardId: ID!, columnId: ID!, cardId: ID!): Boolean`
- `moveCard(boardId: ID!, fromColumnId: ID!, toColumnId: ID!, cardId: ID!, newIndex: Int!): Card` 