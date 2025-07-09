# Guia de Commits / Commit Guide

Este guia fornece instruções detalhadas para fazer commits organizados seguindo as convenções da indústria de software.

This guide provides detailed instructions for making organized commits following software industry conventions.

## 📋 Plano de Commits / Commit Plan

### 1️⃣ **Configuração Inicial do Projeto / Initial Project Setup**

**Arquivos / Files:**
```bash
git add package.json packages/frontend/package.json packages/backend/package.json
git add packages/frontend/angular.json packages/backend/nest-cli.json
git add packages/frontend/tsconfig*.json packages/backend/tsconfig*.json
```

**Mensagem do commit / Commit message:**
```
chore: initial monorepo setup with Angular frontend and NestJS backend

- Set up monorepo structure with packages directory
- Initialize Angular 17 application with standalone components
- Initialize NestJS application with GraphQL support
- Configure TypeScript for both projects
```

---

### 2️⃣ **Schema do Banco de Dados / Database Schema**

**Arquivos / Files:**
```bash
git add supabase-schema.sql
```

**Mensagem do commit / Commit message:**
```
feat: add Supabase database schema for Kanban board

- Create boards, columns, and cards tables
- Add RLS policies for security
- Include position tracking for drag-and-drop
- Add sample data for testing
```

---

### 3️⃣ **Implementação Principal do Backend / Backend Core Implementation**

**Arquivos / Files:**
```bash
git add packages/backend/src/main.ts
git add packages/backend/src/app.module.ts
git add packages/backend/src/supabase/*
git add packages/backend/src/kanban/types/*
git add packages/backend/src/kanban/dto/*
git add packages/backend/src/kanban/services/*
git add packages/backend/src/kanban/resolvers/*
git add packages/backend/src/kanban/kanban.module.ts
```

**Mensagem do commit / Commit message:**
```
feat(backend): implement GraphQL API with Supabase integration

- Add Supabase service for database operations
- Implement GraphQL resolvers for boards, columns, and cards
- Create DTOs with validation using class-validator
- Add CRUD operations for all entities
- Implement position management for drag-and-drop
```

---

### 4️⃣ **Suporte WebSocket em Tempo Real / Real-time WebSocket Support**

**Arquivos / Files:**
```bash
git add packages/backend/src/realtime/*
```

**Mensagem do commit / Commit message:**
```
feat(backend): add WebSocket gateway for real-time collaboration

- Implement Socket.io gateway for real-time updates
- Add board-specific rooms for targeted updates
- Configure CORS for WebSocket connections
```

---

### 5️⃣ **Implementação Principal do Frontend / Frontend Core Implementation**

**Arquivos / Files:**
```bash
git add packages/frontend/src/main.ts
git add packages/frontend/src/index.html
git add packages/frontend/src/styles.scss
git add packages/frontend/src/app/app.component.ts
git add packages/frontend/src/app/app.routes.ts
git add packages/frontend/src/environments/*
```

**Mensagem do commit / Commit message:**
```
feat(frontend): setup Angular app with routing and Material Design

- Configure Angular standalone components
- Set up lazy-loaded routing
- Add Material Design theme
- Configure environment settings
```

---

### 6️⃣ **Componente Lista de Boards / Board List Component**

**Arquivos / Files:**
```bash
git add packages/frontend/src/app/components/board-list/*
```

**Mensagem do commit / Commit message:**
```
feat(frontend): implement board list component

- Display all boards with Material cards
- Add create new board functionality
- Implement delete board with confirmation
- Add navigation to individual boards
```

---

### 7️⃣ **Serviço GraphQL / GraphQL Service**

**Arquivos / Files:**
```bash
git add packages/frontend/src/app/services/graphql.service.ts
```

**Mensagem do commit / Commit message:**
```
feat(frontend): add GraphQL service for API communication

- Implement type-safe GraphQL queries and mutations
- Add error handling and logging
- Support all CRUD operations for boards, columns, and cards
- Add move operations for drag-and-drop
```

---

### 8️⃣ **Componente Kanban Board (Básico) / Kanban Board Component (Basic)**

**Arquivos / Files:**
```bash
git add packages/frontend/src/app/components/kanban-board/kanban-board.component.ts
```

**Mensagem do commit / Commit message:**
```
feat(frontend): implement Kanban board with CRUD operations

- Display board with columns and cards
- Add inline editing for columns and cards
- Implement create, update, delete operations
- Add Material Design UI components
- Include responsive design
```

---

### 9️⃣ **Funcionalidade Drag and Drop / Drag and Drop Feature**

**Arquivos / Files:**
```bash
git add packages/frontend/src/app/components/kanban-board/kanban-board.component.ts
```

**Mensagem do commit / Commit message:**
```
feat(frontend): add drag-and-drop functionality for cards and columns

- Implement Angular CDK drag-and-drop
- Support card movement within and between columns
- Add column reordering with drag handles
- Include visual feedback and animations
- Add smooth transitions and hover effects
```

---

### 🔟 **Correção de Posição de Colunas / Column Position Fix**

**Arquivos / Files:**
```bash
git add packages/backend/src/kanban/services/column.service.ts
git add packages/frontend/src/app/components/kanban-board/kanban-board.component.ts
```

**Mensagem do commit / Commit message:**
```
fix: resolve column drag-and-drop position persistence issue

- Simplify backend column reordering logic
- Fix frontend position calculation
- Add comprehensive logging for debugging
- Ensure columns maintain positions after reload
```

---

### 1️⃣1️⃣ **Melhoria de Navegação / Navigation Enhancement**

**Arquivos / Files:**
```bash
git add packages/frontend/src/app/components/kanban-board/kanban-board.component.ts
```

**Mensagem do commit / Commit message:**
```
feat(frontend): add navigation back to board list

- Add breadcrumb navigation with icons
- Include back button with tooltip
- Implement Alt+B keyboard shortcut
- Add responsive design for mobile
```

---

### 1️⃣2️⃣ **Documentação / Documentation**

**Arquivos / Files:**
```bash
git add README.md SETUP.md
```

**Mensagem do commit / Commit message:**
```
docs: add comprehensive project documentation

- Create detailed README with features and tech stack
- Add step-by-step SETUP guide
- Include troubleshooting section
- Document project structure and scripts
```

---

### 1️⃣3️⃣ **Configuração Git / Git Configuration**

**Arquivos / Files:**
```bash
git add .gitignore clean.sh clean.bat
```

**Mensagem do commit / Commit message:**
```
chore: configure git ignore and add cleanup scripts

- Add comprehensive .gitignore for monorepo
- Exclude build outputs, env files, and IDE files  
- Create cleanup scripts for both Unix and Windows
- Ensure only essential files are tracked
```

---

### 1️⃣4️⃣ **Scripts do Projeto / Project Scripts**

**Arquivos / Files:**
```bash
git add package.json
```

**Mensagem do commit / Commit message:**
```
chore: add helpful npm scripts for development

- Add concurrent dev script to run both servers
- Include build, test, and clean commands
- Add fresh-install script for clean setup
```

---

### 1️⃣5️⃣ **Assets e Templates / Assets and Templates**

**Arquivos / Files:**
```bash
git add assets/*
git add PULL_REQUEST_TEMPLATE.md
```

**Mensagem do commit / Commit message:**
```
chore: add project assets and PR template

- Include project images and icons
- Add pull request template for contributions
```

---

### 1️⃣6️⃣ **Testes do Backend / Backend Tests** (se existirem / if any)

**Arquivos / Files:**
```bash
git add packages/backend/src/**/*.spec.ts
```

**Mensagem do commit / Commit message:**
```
test(backend): add unit tests for services

- Add tests for board service operations
- Include test setup and mocks
```

---

## 🎯 Dicas Profissionais / Pro Tips

### Antes de fazer commit / Before committing:
```bash
npm run clean      # Limpar arquivos que não devem ser commitados / Clean files that shouldn't be committed
git status         # Verificar quais arquivos estão staged / Check what files are staged
```

### Verificar cada commit / Verify each commit:
```bash
git diff --staged  # Revisar mudanças antes do commit / Review changes before committing
```

### Se cometer um erro / If you make a mistake:
```bash
git reset HEAD~1   # Desfazer último commit (mantém as mudanças) / Undo last commit (keep changes)
```

### Para arquivo de exemplo de ambiente / For environment example file:
```bash
cp packages/backend/.env packages/backend/env.example
# Editar env.example para remover valores reais / Edit env.example to remove actual values
git add packages/backend/env.example
```

**Mensagem do commit / Commit message:**
```
docs: add environment variables example file
```

---

## 📚 Convenções de Commit / Commit Conventions

### Tipos / Types:
- **feat**: Nova funcionalidade / New feature
- **fix**: Correção de bug / Bug fix
- **docs**: Mudanças na documentação / Documentation changes
- **style**: Formatação, sem mudança de código / Formatting, no code change
- **refactor**: Refatoração sem mudança de funcionalidade / Refactoring without functionality change
- **test**: Adição ou correção de testes / Adding or fixing tests
- **chore**: Mudanças no build ou ferramentas auxiliares / Build changes or auxiliary tools

### Formato / Format:
```
<tipo>(<escopo>): <descrição curta>

<descrição detalhada opcional>

<rodapé opcional>
```

### Exemplos / Examples:
```
feat(frontend): add user authentication

- Implement login/logout functionality
- Add JWT token handling
- Create auth guard for protected routes

Closes #123
```

---

## 🔄 Fluxo de Trabalho Git / Git Workflow

1. **Criar branch para feature** / **Create feature branch**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Fazer commits seguindo este guia** / **Make commits following this guide**

3. **Push da branch** / **Push branch**
   ```bash
   git push origin feature/nome-da-feature
   ```

4. **Criar Pull Request** / **Create Pull Request**

---

## ⚠️ Importante / Important

- Sempre rode `npm run clean` antes de commitar / Always run `npm run clean` before committing
- Nunca commite arquivos `.env` / Never commit `.env` files
- Mantenha commits pequenos e focados / Keep commits small and focused
- Use mensagens descritivas / Use descriptive messages
- Siga a ordem sugerida para manter histórico limpo / Follow suggested order for clean history 