# Kanban Board - Angular & NestJS Monorepo

Este projeto implementa um quadro Kanban com funcionalidade de arrastar e soltar, usando Angular para o frontend e NestJS para o backend, organizado em um monorepo NX.

## ✨ Funcionalidades

- ✅ **CRUD completo** para colunas e cards
- ✅ **Arrastar e Soltar** para colunas e cards
- ✅ **Persistência de posições** após atualização
- ✅ **Interface responsiva** com Tailwind CSS
- ✅ **Cobertura completa de testes** (Unit + E2E)
- ✅ **Tipos compartilhados** entre frontend e backend
- ✅ **Pronto para desenvolvimento local**

## 🚀 Tecnologias Utilizadas

### Backend (NestJS)

- **NestJS** - Framework Node.js
- **TypeORM** - ORM TypeScript
- **SQLite** - Banco de dados
- **class-validator** - Validação de dados
- **class-transformer** - Transformação de dados

### Frontend (Angular)

- **Angular 20** - Framework frontend
- **Angular CDK** - Componentes e utilitários
- **Tailwind CSS** - Framework CSS
- **RxJS** - Programação reativa

### DevOps

- **NX** - Monorepo e ferramentas de build
- **Jest** - Testes unitários
- **Cypress** - Testes E2E
- **TypeScript** - Tipagem estática
- **ESLint** - Linting e formatação

## 📁 Estrutura do Projeto

```
apps/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── features/        # Módulos de funcionalidades
│   │   │   ├── columns/     # Módulo de colunas
│   │   │   │   ├── dto/     # DTOs de validação
│   │   │   │   ├── entities/ # Entidades TypeORM
│   │   │   │   ├── *.controller.ts
│   │   │   │   ├── *.service.ts
│   │   │   │   └── *.module.ts
│   │   │   └── cards/       # Módulo de cards
│   │   │       ├── dto/
│   │   │       ├── entities/
│   │   │       ├── *.controller.ts
│   │   │       ├── *.service.ts
│   │   │       └── *.module.ts
│   │   ├── database/        # Configuração do banco de dados
│   │   └── app/            # Módulo principal
├── frontend/               # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Componentes Kanban
│   │   │   │   ├── kanban-board/
│   │   │   │   ├── kanban-column/
│   │   │   │   ├── add-column-dialog/
│   │   │   │   ├── add-card-form/
│   │   │   │   └── delete-confirmation-modal/
│   │   │   ├── services/    # Serviços Angular
│   │   │   └── models/      # Interfaces TypeScript
│   │   └── styles.css
├── frontend-e2e/           # Testes E2E do frontend
├── backend-e2e/            # Testes E2E do backend
└── libs/
    └── shared/
        └── types/          # Tipos compartilhados
```

## 🛠 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Executar backend e frontend simultaneamente
npm run dev:backend         # Apenas backend
npm run dev:frontend        # Apenas frontend

# Build
npm run build               # Build de ambos
npm run build:backend       # Build do backend
npm run build:frontend      # Build do frontend

# Testes
npm run test                # Testes unitários de ambos
npm run test:backend         # Testes unitários do backend
npm run test:frontend        # Testes unitários do frontend
npm run e2e:frontend         # Testes E2E do frontend
npm run e2e:backend          # Testes E2E do backend

# Linting
npm run lint                 # Lint de ambos os projetos
```

## 🚀 Como Executar

### Desenvolvimento Local

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**

   ```bash
   npm run dev
   ```

3. **Acessar as aplicações:**
   - Frontend: http://localhost:4200
   - API Backend: http://localhost:3000/api

## 📊 Endpoints da API

### Colunas

- `GET /api/columns` - Listar todas as colunas
- `POST /api/columns` - Criar nova coluna
- `GET /api/columns/:id` - Obter coluna por ID
- `PATCH /api/columns/:id` - Atualizar coluna
- `DELETE /api/columns/:id` - Deletar coluna
- `PATCH /api/columns/positions/update` - Atualizar posições

### Cards

- `GET /api/cards` - Listar todos os cards
- `GET /api/cards?columnId=:id` - Listar cards de uma coluna
- `POST /api/cards` - Criar novo card
- `GET /api/cards/:id` - Obter card por ID
- `PATCH /api/cards/:id` - Atualizar card
- `DELETE /api/cards/:id` - Deletar card
- `PATCH /api/cards/:id/move` - Mover card entre colunas
- `PATCH /api/cards/positions/update` - Atualizar posições

## 🧪 Testes

### Backend

- **Testes unitários:** Jest
- **Testes de integração:** Jest + Supertest

### Frontend

- **Testes unitários:** Jest + Angular Testing Utilities
- **Testes E2E:** Cypress

## 🔧 Configuração

### Banco de Dados

O projeto usa SQLite por padrão, configurado em `apps/backend/src/database/database.config.ts`. O arquivo do banco de dados (`kanban.db`) é criado automaticamente quando você executa a aplicação pela primeira vez.
