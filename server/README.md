## Ferramentas utilizadas
Node.js (v18 ou superior)

Framework: NestJS (Node.js)
API: GraphQL (Code First Approach)
Banco de Dados: PostgreSQL (via Docker)
ORM: Prisma (v5)
Testes: Jest (Unitários e E2E)

## Setup do projeto

# Docker e Docker Compose (para o banco de dados)
```bash
$ docker-compose up -d
```

# Instale as dependências
```bash
$ npm install
```

# Gere os artefatos do Prisma
```bash
$ npx prisma generate
```

# Rode as migrations para criar as tabelas
```bash
$ npx prisma migrate dev --name init
```

## Compile and run the project

# development
```bash 
$ npm run start
```

# watch mode
```bash
$ npm run start:dev
```

## Run tests

# testes unitários
```bash
$ npm run test
```

# testes e2e
```bash
$ npm run test:e2e
```
