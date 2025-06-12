# Valinor Kanban Backend

Este é o backend do Kanban desenvolvido em NestJS, TypeORM, GraphQL e PostgreSQL.

## Requisitos

- Node.js 18+
- PostgreSQL

## Instalação

```bash
cd valinor-backend
npm install
```

## Configuração do Banco de Dados

Edite o arquivo `src/data-source.ts` e preencha com seu usuário, senha e nome do banco:

```typescript
  username: 'seu_usuario',
  password: 'sua_senha',
  database: 'nome_db',
```

Crie o banco de dados no PostgreSQL com o mesmo nome e owner.

## Migrations

**Importante:** Antes de rodar, garanta que o banco está vazio e que `synchronize` e `dropSchema` estão `false` no `data-source.ts`.

Para gerar uma migration após alterar entidades:
```bash
npx typeorm-ts-node-commonjs migration:generate src/migrations/MinhaMigration --dataSource src/data-source.ts
```

Para rodar as migrations:
```bash
npx typeorm-ts-node-commonjs migration:run --dataSource src/data-source.ts
```

## Rodando o projeto

```bash
npm run start:dev
```

Acesse o GraphQL Playground em [http://localhost:3000/graphql](http://localhost:3000/graphql)

## Testes

Para rodar os testes unitários do backend:

```bash
npm run test
```

Os testes cobrem as principais regras de negócio dos services de cards e colunas.

## Funcionalidades

- API GraphQL para gerenciamento de colunas e cards.
- Migrations versionadas com TypeORM.
- Relacionamento entre colunas e cards.
- Validações e tratamento de erros.

## Observações

- Nunca deixe `synchronize: true` em produção.
- Sempre rode as migrations após clonar o projeto ou alterar entidades.
- O frontend espera o backend rodando em `http://localhost:3000`.

---
