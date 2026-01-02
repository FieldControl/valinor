# Valinor Kanban

## Pré-requisitos

- Node.js >= 20
- Docker & Docker Compose

## Backend

### Para rodar o backend, siga os passos abaixo:

Entre na pasta backend

```bash
cd backend
```

Copie o arquivo .env.example para .env

```bash
cp .env.example .env
```

Suba o container docker com serviço do Postgres

```bash
docker-compose up -d
```

Isso iniciará o container do Postgres na porta `5432`.

Instale dependências do projeto

```bash
npm install
```

Gere o cliente Prisma

```bash
npx prisma generate
```

Inicie o servidor em modo desenvolvimento

```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

## Frontend

### Para rodar o frontend, siga os passos abaixo:

Entre na pasta frontend

```bash
cd frontend
```

instale dependências do projeto

```bash
npm install
```

Inicie o servidor em modo desenvolvimento

```bash
npm start
```

O frontend estará rodando em `http://localhost:4200`
