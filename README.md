# 📁 Projeto Kanban - Processo Seletivo Field Control


Sistema **Kanban** completo desenvolvido como desafio técnico para o processo seletivo da **Field Control**.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)

![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)

![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---



---

## 📄 Descrição

Este projeto é uma aplicação Full-Stack que implementa um sistema Kanban visual e intuitivo. Ele permite gerenciar múltiplos quadros, colunas e cartões, com suporte a **arrastar e soltar (drag and drop)** e persistência de dados em um banco de dados local.

A arquitetura é composta por um backend em **NestJS** que expõe uma API **GraphQL** e um frontend em **Angular** que consome esses dados, proporcionando uma experiência de usuário rica e reativa.

## ✅ Funcionalidades Implementadas

-   **Gestão de Quadros:** Crie, edite e exclua múltiplos quadros (boards).
-   **Gestão de Colunas:** Adicione, edite, remova e reordene colunas dentro de cada quadro.
-   **Gestão de Cards:** Crie, edite e exclua cartões de tarefas com título e descrição.
-   **Drag and Drop:** Arraste e solte cards entre colunas para atualizar o status das tarefas em tempo real.
-   **Persistência de Dados:** Todas as ações são salvas automaticamente no banco de dados SQLite.

## 🚀 Tecnologias Utilizadas

| Camada         | Tecnologias                                   |
| -------------- | --------------------------------------------- |
| **Backend** | NestJS, GraphQL (Apollo Server), TypeORM      |
| **Frontend** | Angular, Angular Material, Apollo Client (GraphQL) |
| **Banco de Dados** | SQLite                                        |

## 📁 Estrutura do Projeto

O repositório está organizado em duas pastas principais, uma para o backend e outra para o frontend.

```
.
├── 📂 kanban-api/   # Backend (NestJS + GraphQL + SQLite)
└── 📂 kanban-app/   # Frontend (Angular)
```

## ⚙️ Como Rodar o Projeto Localmente

Siga os passos abaixo para executar a aplicação completa.

### **1. Pré-requisitos**

-   [Node.js](https://nodejs.org/en/) (v18 ou superior)
-   [Git](https://git-scm.com/)
-   [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)


### **2. Inicie o Backend (API NestJS)**

```bash
# Navegue até a pasta da API
cd kanban-api

# Instale as dependências
npm install

# Inicie o servidor em modo de desenvolvimento
npm run start:dev
```

-   ✅ A API estará rodando em `http://localhost:3000`.
-   ➡️ Para interagir com a API, acesse o **GraphQL Playground** em: `http://localhost:3000/graphql`.
-   *Observação: O arquivo do banco de dados (`kanban.db`) será criado automaticamente na pasta `kanban-api/` na primeira execução.*

### **3. Inicie o Frontend (Aplicação Angular)**

**Em um novo terminal**, execute os seguintes comandos:

```bash
# Navegue até a pasta da aplicação (a partir da raiz do projeto)
cd kanban-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento do Angular
npm start
```

-   ✅ A aplicação estará acessível no seu navegador em: `http://localhost:4200`.

---

## 📝 Observações sobre o Projeto

-   **Comunicação via GraphQL:** Toda a comunicação entre o frontend e o backend é feita através de queries e mutations GraphQL, utilizando o Apollo Client no lado do cliente.
-   **Banco de Dados Local:** A escolha do SQLite visa a simplicidade e portabilidade, eliminando a necessidade de configurar um banco de dados externo para avaliação e testes locais.
-   **Foco do Desafio:** O projeto foi desenvolvido para demonstrar competências em arquitetura de software moderna, boas práticas de desenvolvimento com NestJS e Angular, e integração de APIs GraphQL.

## 📬 Contato

Este projeto foi desenvolvido com dedicação por:

**Gustavo Ancete**

-   **E-mail:** `gustavoaancete@gmail.com`
-   **LinkedIn:** [https://www.linkedin.com/in/gustavo-ancete/](https://www.linkedin.com/in/seu-perfil) 
