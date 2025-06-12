# Valinor Kanban Frontend

Este é o frontend do Kanban desenvolvido em Angular para o desafio técnico.

## Requisitos

- Node.js 18+
- npm 9+
- Backend rodando em http://localhost:3000

## Instalação

```bash
cd valinor-frontend
npm install
```

## Rodando o projeto

```bash
npm start
```

Acesse em [http://localhost:4200](http://localhost:4200)

## Funcionalidades

- Criação, edição, exclusão e movimentação de notas entre colunas.
- Layout responsivo e centralizado.
- Modal para criação/edição de notas sobrepondo a tela.
- Validação de campos obrigatórios.
- Integração total com o backend via GraphQL.

## Observações

- O backend precisa estar rodando para o frontend funcionar corretamente.
- O endpoint do backend GraphQL está configurado em `src/app/core/graphql.service.ts` (altere se necessário).
- As configurações de estilo estão em `src/styles.scss`.
- Para customizar o layout, edite os arquivos SCSS ou os componentes Angular.

## Scripts úteis

- `npm start` — inicia o servidor de desenvolvimento.
- `npm run build` — gera o build de produção.
- `npm test` — executa os testes unitários.

---
