#  Kanban Board Fullstack

![Status](https://img.shields.io/badge/Status-Concluído-green?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0C05?style=for-the-badge&logo=typeorm&logoColor=white)

> Um sistema de gerenciamento de tarefas visual (estilo Trello) desenvolvido com arquitetura moderna, separando Frontend e Backend em um monorepo.

---
##  Sobre o Projeto

Este projeto é uma aplicação **Fullstack** que implementa um quadro Kanban interativo. O objetivo principal foi criar uma arquitetura limpa onde o Frontend (Angular) consome uma API RESTful (NestJS), com persistência de dados em banco relacional (PostgreSQL).

**Principais desafios técnicos resolvidos:**
* **Comunicação entre Componentes:** Sincronização de estado entre componentes pais e filhos no Angular.
* **Drag & Drop:** Implementação fluida de arrastar e soltar tarefas usando `Angular CDK`.
* **API Robusta:** Backend em NestJS com tratamento de erros e validação de dados.

---

##  Tecnologias Utilizadas

### **Frontend** (`/frontend`)
- **Angular 17+** (Standalone Components)
- **Angular CDK** (Drag & Drop)
- **HTML5 & CSS3** (Flexbox, Grid e Variáveis CSS)
- **TypeScript**

### **Backend** (`/backend`)WS
- **NestJS** (Framework progressivo para Node.js)
- **TypeORM** (ORM para abstração do banco de dados)
- **PostgreSQL** (Banco de dados relacional)

---

##  Funcionalidades

- [x] **Gestão de Colunas**: Criar e excluir listas de tarefas dinamicamente.
- [x] **Gestão de Cards**: Adicionar tarefas com título e descrição.
- [x] **Drag & Drop**: Arrastar cards entre colunas diferentes livremente.
- [x] **Interface Limpa**: Formulários inline para criação rápida (UX focada em produtividade).
- [x] **Persistência Real**: Todos os dados e movimentos são salvos no banco de dados.

---

##  Instalação e Execução

Siga os passos abaixo para rodar o projeto em sua máquina local.

### 1. Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** (v18 ou superior)
- **Git**
- **PostgreSQL** (Rodando na porta padrão 5432)

### Backend (NestJS)

2. Navegue até o diretório do backend:
   ```bash
   cd kanban-backend
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start:dev
   ```

   O backend estará disponível em `http://localhost:3000`.

### Frontend (Angular)

1. Navegue até o diretório do frontend:
   ```bash
   cd kanban-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

   O frontend estará disponível em `http://localhost:4200`
