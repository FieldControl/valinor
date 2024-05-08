
# Aplicação Kanban

Este projeto é uma aplicação Kanban, que é dividida em duas partes principais: o frontend (`web`) e o backend (`server`).

A aplicação esta rodando em [jurkokanban.vercel.app](jurkokanban.vercel.app)!

## Web (Frontend)

O frontend da aplicação foi desenvolvido utilizando **Angular** e **Angular Material** para fornecer uma interface de usuário rica e interativa.

### Pré-requisitos

- Node.js
- Angular CLI

### Instalação

Para configurar o ambiente de desenvolvimento do frontend, siga estes passos:

```bash
cd web
npm install
```

### Execução

Para executar o frontend localmente:

```bash
npm run start
```

A aplicação estará disponível em `http://localhost:4200`.

## Server (Backend)

O backend foi construído usando **NestJS** e **Prisma** para gerenciar as operações do banco de dados e fornecer uma API robusta para o frontend.
- [Documentacao da API](server/README.md)

### Pré-requisitos

- Node.js
- Docker (opcional, para banco de dados)
- .env
  ```bash
  DATABASE_URL="postgresql://docker:docker@localhost:5432/kanban?schema=public" //dev
  DATABASE_URL="postgresql://postgres:nfzfByUVIEGLiLHnKaceXNmVvWiDKhjA@monorail.proxy.rlwy.net:12348/railway" //prod
  ```
### Instalação

Para configurar o ambiente de desenvolvimento do backend, siga estes passos:

```bash
cd server
npm install
docker compose up -d
npx prisma migrate dev
```
### Execução

Para executar o backend localmente:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.
