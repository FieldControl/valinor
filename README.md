# 📌 Projeto Kanban Full Stack

## 📝 Descrição do Projeto

Este é um projeto completo de quadro Kanban, desenvolvido com **Angular** no frontend e **NestJS** no backend. A aplicação permite que múltiplos usuários se registrem e criem seus próprios quadros Kanban, com colunas e cards totalmente isolados e protegidos.

O sistema possui um fluxo completo de autenticação com **JWT**, persistência de dados em banco relacional e funcionalidades de gestão de perfil, demonstrando uma arquitetura robusta e escalável.

---

## 💪 Desafios Enfrentados

O maior desafio foi aprender as tecnologias utilizadas. Iniciei com apenas um conhecimento básico em JavaScript e, nos dois primeiros dias do projeto, mergulhei no estudo de **TypeScript**, **Angular**, **NestJS**, **Node.js** e várias bibliotecas.

Comecei criando um micro projeto de Kanban apenas com HTML, CSS e JS, baseado em tutoriais do YouTube. Depois, tentei migrar para o Angular e percebi a necessidade de entender melhor o ecossistema. Após dois dias de estudo, comecei a escrever a aplicação real.

Foi um desafio intenso, mas extremamente recompensador. Descobri um grande interesse por Angular, NestJS e, principalmente, TypeScript.

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação de Usuários
- Cadastro com senhas criptografadas (**bcrypt**).
- Login com email e senha.
- Geração de tokens **JWT**.
- Rotas protegidas no frontend e backend.

### 👥 Multi-Tenancy (Isolamento de Dados)
- Cada usuário possui seu próprio ambiente.
- Colunas e cards são visíveis e modificáveis apenas pelo dono.
- Backend garante isolamento seguro entre os dados.

### 📋 Gestão do Quadro Kanban
- Criação, listagem e exclusão de colunas.
- Criação, exclusão e atualização de cards (com título e prioridade).
- **Drag & Drop** com persistência no banco de dados.

### 🧑‍💼 Gestão de Perfil
- Menu de conta com exibição e atualização de dados.
- Upload de foto de perfil.
- Logout com invalidação segura da sessão.

### 🧠 Experiência do Usuário (UX)
- Interface limpa e responsiva.
- Spinners durante carregamento de dados.
- Toasts para mensagens de erro e sucesso.
- Scrollbars customizadas.

---

## 🚧 Melhorias Futuras

A última melhoria tentada foi o deploy da aplicação em ambiente público. Utilizei **Netlify** e **Vercel** para o frontend, e **Render** para o backend. O backend foi implementado com sucesso, mas o frontend apresentou um erro que impediu a publicação.

Pretendo resolver esse problema e disponibilizar o projeto online no futuro.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- [Angular](https://angular.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Angular CDK - Drag & Drop](https://material.angular.io/cdk/drag-drop/overview)
- [RxJS](https://rxjs.dev/)

### Backend
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/) (produção)
- [SQLite](https://www.sqlite.org/index.html) (desenvolvimento)
- [Passport.js](http://www.passportjs.org/) (`passport-jwt` e `bcrypt`)

### Testes (Backend)
- [Jest](https://jestjs.io/)

---

## 🚀 Como Executar o Projeto

### 🔧 Pré-requisitos

Certifique-se de ter instalado:

- [Node.js (v18+)](https://nodejs.org/en/)
- [Angular CLI](https://angular.io/cli):  
  `npm install -g @angular/cli`
- [NestJS CLI](https://docs.nestjs.com/):  
  `npm install -g @nestjs/cli`

### 1. Clonar o Repositório

```bash
git clone https://github.com/GRiguetto/Kanban.git
cd Kanban

```
### 2. Rodar o Backend
```bash
cd kanban-backend
npm install
npm run start:dev
```
O backend estará rodando em http://localhost:3000

### 3. Rodar o Frontend
Em outro terminal:

```bash

cd kanban-frontend
npm install
ng serve
```
O frontend estará disponível em http://localhost:4200

---
### 🧪 Executando Testes
Para rodar os testes do backend:

```bash

cd kanban-backend
npm run test
```
Isso executará os testes unitários e de integração, mostrando a cobertura no terminal.

---
### 👨‍💻 Sobre Mim
Meu nome é Gabriel, tenho 18 anos e moro em São José do Rio Preto. Concluí o ensino médio em 2024, junto com um curso técnico em Informática pelo Senac, onde descobri minha paixão pelo desenvolvimento de software.

Atualmente estou no 2º semestre da Fatec Rio Preto. Já desenvolvi projetos acadêmicos como um sistema ERP em C#/.NET e sites em HTML/CSS/JS. Porém, este projeto de Kanban foi o mais desafiador e gratificante até agora, principalmente por me levar a estudar tecnologias novas como Angular, NestJS e TypeScript — que pretendo continuar utilizando na minha carreira.
