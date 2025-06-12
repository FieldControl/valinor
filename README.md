# Valinor Monorepo

Este repositório contém o back‑end e o front‑end do projeto **Valinor**, organizado em monorepo:

```
/                     ← raiz do monorepo
├── package.json      ← scripts para iniciar ambos
├── app-backend/      ← API NestJS + Prisma + Docker Compose
│   ├── docker-compose.yml  ← configuração do Postgres local
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts          ← script de _seed_ para criar usuário admin inicial
│   ├── src/
│   └── package.json        ← scripts e seed do Prisma
└── frontend/         ← app Angular SSR + Socket.io
```

---

## 🚀 Scripts do Monorepo (na raiz)

| Comando                  | Descrição                                |
| ------------------------ | ---------------------------------------- |
| `npm run start:backend`  | Inicia back‑end em modo desenvolvimento  |
| `npm run start:frontend` | Inicia front‑end em modo desenvolvimento |

> Os comandos acima chamam os scripts definidos em `app-backend/package.json` e `frontend/package.json`.

---

## 🐳 Back‑end (app-backend)

### Pré‑requisitos

* Node.js ≥ 20
* Docker & Docker Compose

### Instalação e execução

1. Entre na pasta do back‑end:

   ```bash
   cd app-backend
   ```

2. Copie o `.env.example` para `.env` e ajuste se necessário.

3. Levante o Postgres via Docker Compose (no diretório `app-backend`):

   ```bash
   docker-compose up -d
   ```

   Isso criará um container `kanban_postgres` na porta 5432 com o banco `kanban_db` e credenciais definidas.

4. Instale dependências e gere o cliente Prisma:

   ```bash
   npm install
   npx prisma generate
   ```

5. Rode a seed para criar o usuário **admin** inicial:

   ```bash
   npx prisma db seed
   ```

6. Inicie em modo desenvolvedor:

   ```bash
   npm run start:dev
   ```

> O back‑end estará disponível em `http://localhost:3000`.

---

## 🌐 Front‑end (frontend)

### Pré‑requisitos

* Node.js ≥ 20

### Instalação e execução

1. Entre na pasta do front‑end:

   ```bash
   cd frontend
   ```

2. Instale dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

> O front‑end estará disponível em `http://localhost:4200`.

---

## 🧪 Testes E2E (Back‑end)

Dentro de `app-backend`:

```bash
npm run test:e2e
```

---

## 📄 Documentação Swagger (Back‑end)

Após iniciar o back‑end, acesse:

```
http://localhost:3000/docs
```

---

## 📝 Observações finais

* Certifique‑se de ter todas as variáveis de ambiente configuradas.
* Toda alteração no Prisma Schema requer `npx prisma migrate dev`.
* Para utilização local com Docker Compose, use o `docker-compose.yml` dentro de `app-backend`.
