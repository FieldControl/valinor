# 🗂️ Projeto Kanban - Teste Técnico

Esta pull-request contém a implementação de um **Kanban** utilizando **Angular** no front-end e **NestJS** no back-end.

## Método de Desenvolvimento

Visando encontrar as informações necessárias para concluir este desafio, realizei consultas em tutoriais no Youtube, fóruns como Stack Overflow e Mozilla CDN, as documentações oficiais dos frameworks utilizados e IAs generativas.

## ✨ Funcionalidades

- Cadastro de usuários com autenticação
- Criação, visualização, edição e exclusão (CRUD) de:
  - Colunas (Swimlanes)
  - Quadros (Boards)
  - Cartões (Cards)
- Interface limpa e responsiva utilizando Angular Material e Angular CDK
- Integração completa entre front-end e back-end
- Código modularizado e com boas práticas de desenvolvimento
- Testes unitários e integrados no servidor

## 🧠 Tecnologias Utilizadas

### 🔧 Backend (NestJS)
- [NestJS](https://nestjs.com/) - Estrutura Node.js progressiva
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [TypeORM](https://typeorm.io/) - ORM para MySQL
- [JWT](https://jwt.io/) - Autenticação via tokens
- [Bcrypt](https://www.npmjs.com/package/bcrypt) - Criptografia de senhas
- [Class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer) - Validação e transformação de objetos

### 🎨 Frontend (Angular)
- [Angular 17](https://angular.io/) - Framework web SPA
- [Angular Material](https://material.angular.io/) - UI components
- [SCSS](https://sass-lang.com/) - Estilização
- [RxJS](https://rxjs.dev/) - Programação reativa
- [Angular CDK](https://material.angular.io/cdk/drag-drop/overview) - Reordenação via drag & drop
- [JWT Interceptor](https://angular.io/guide/http#intercepting-requests-and-responses) - Interceptação HTTP para autenticação

## 🔍 Funcionalidades

- Cadastro e autenticação de usuários (JWT)
- Criação, edição e exclusão de:
  - Boards (Quadros)
  - Swimlanes (Listas)
  - Cards (Tarefas)
- Reordenação de cards e swimlanes (Através do método cdkDrag da Biblioteca Angular CDK)
- Proteção de rotas com guards
- Interface responsiva e agradável
- Confirmação de ações críticas
- Comunicação backend <-> frontend via REST API

## 🎯 Motivações Tecnológicas

- **NestJS** foi escolhido pela arquitetura modular e suporte nativo ao TypeScript, o que favorece escalabilidade e manutenção do projeto.
- **Angular** possui estrutura robusta para aplicações corporativas com componentes reutilizáveis, além de forte tipagem e integração com RxJS para reatividade.
- A combinação **NestJS + Angular** permite separação de responsabilidades, facilidade de testes e integração fluida via REST API.

## 🧱 Princípios de Engenharia Aplicados

- **Modularização**: Separação clara entre funcionalidades (ex: auth, cards, boards, swimlanes)
- **Responsabilidade Única (SRP)**: Cada classe ou função possui uma única responsabilidade
- **DRY** (Don't Repeat Yourself): Componentes e serviços reutilizáveis
- **KISS** (Keep It Simple, Stupid): Implementações objetivas e diretas
- **Validação de Entrada**: DTOs com class-validator e tratamento de erros com filters
- **Camada de Serviço (Service Layer)**: Lógica desacoplada dos controladores
- **Guards e Interceptadores**: Segurança e controle de fluxo com JWT e interceptação HTTP

## ⚔️ Desafios e Soluções

| Desafio | Solução |
|--------|---------|
| Integração entre frontend e backend | Definição clara de contratos (DTOs) e uso do Angular HTTPClient com interceptores |
| Reordenação de elementos com persistência | Uso de `cdkDropList` e atualização da ordenação no backend via PATCH |
| Manter autenticação persistente e segura | JWT salvo no LocalStorage + interceptor Angular para enviar o token |
| Modularização e reuso de componentes | Estrutura baseada em features, componentes e serviços bem definidos |
| Comunicação entre componentes distantes | RxJS Subjects e serviços compartilhados para propagação de eventos |

## 💡 Melhorias Futuras

- **Implementar testes E2E no frontend**
- **Aplicar loading states nas requisições**
- **Refatorar backend para utilizar GraphQL e um banco de dados não relacional**
- **Adicionar refresh token e expiração JWT**
- **Modo dark/light no front-end**
- **Melhoria na usabilidade mobile**
- **Acrescentar mais métodos de autenticação e segurança ao tratamento de usuários**

## 🛠 Como rodar o projeto

### 📌 Pré-requisitos

- Node.js (v18+)
- NPM ou Yarn (Utilizei somente NPM)
- Angular CLI
- Banco de dados MySQL (Criar um banco de nome "kanban" antes de iniciar o backend)

###  Backend

```bash
# Entrar na pasta do backend
cd app

# Instalar dependências
npm install

# Rodar servidor
npm run start:dev
```

###  Frontend

```bash
# Entrar na pasta do frontend
cd web

# Instalar dependências
npm install

# Rodar aplicação Angular
ng serve
```
