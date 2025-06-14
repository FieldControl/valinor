# Sistema de Gerenciamento Kanban

## Descrição
Sistema completo de gerenciamento de tarefas utilizando metodologia Kanban, desenvolvido com Angular (frontend) e NestJS (backend). O projeto permite criação de quadros, colunas e tarefas com funcionalidades de autenticação e autorização.

## Arquitetura do Projeto

### Backend (API)
- **Framework**: NestJS
- **Banco de Dados**: SQLite com TypeORM
- **Autenticação**: JWT
- **Validação**: class-validator e class-transformer
- **Criptografia**: bcrypt para senhas

### Frontend
- **Framework**: Angular 20
- **Formulários**: Reactive Forms
- **Estilização**: SCSS
- **Autenticação**: JWT com interceptors
- **Estado**: RxJS com Signals

## Estrutura do Banco de Dados

### Entidades Principais
- **User**: Gerenciamento de usuários
- **Board**: Quadros Kanban
- **Column**: Colunas dos quadros
- **Task**: Tarefas individuais

### Relacionamentos
- User → Board (1:N)
- Board → Column (1:N)
- Column → Task (1:N)

## Pré-requisitos

### Software Necessário
- Node.js (versão 18 ou superior)
- npm (versão 8 ou superior)
- Angular CLI (versão 20)

## Instalação e Configuração

### 1. Configuração do Backend (API)
```bash
# Navegue para o diretório da API
cd api

# Instale as dependências
npm install

# Execute as migrações do banco de dados
npm run typeorm:run-migrations

# Inicie o servidor de desenvolvimento
npm run start
```

O servidor backend estará disponível em `http://localhost:3000`

### 2. Configuração do Frontend
```bash
# Em um novo terminal, navegue para o diretório do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve
```

O aplicativo frontend estará disponível em `http://localhost:4200`