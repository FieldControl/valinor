# Kanban Board Project

Projeto de Kanban Board com backend em **NestJS** e frontend em **Angular**. Permite criar, atualizar e deletar **cards** e **columns**, além de contar com um **chatbot integrado ao OpenAI**, possibilitando automações.

## Link de acesso web

[Clique aqui para acessar o projeto](https://kanban-val-client.netlify.app/)

## 🚀 Como rodar localmente

### Backend





```
cd backend
npm install
npx prisma generate
npm run start:dev
```

Executar testes unitários:

```
cd backend
npm run test
```

### Frontend

```
cd frontend
npm install
ng serve
```

## 🎥 Demonstração do Kanban Board
Clique para assistir ao vídeo:



https://github.com/user-attachments/assets/d631b02c-6ae9-45c9-a5a5-c95277bb9af8



**prompt utilizado na desmontração**:
"Create a complete project management workflow, including all typical stages of planning, execution, monitoring, and delivery. For each stage, include demonstrative cards with realistic examples of tasks, assignees, deadlines, and status. At the end, generate detailed documentation of the workflow, explaining the logic, the stages, task prioritization, and how the cards relate to each other within the process."

## 📂 Estrutura do Projeto

```
backend/   # NestJS
  src/
    modules/
    common/
    database/

frontend/  # Angular
  src/
    app/
      features/
      shared/
      types
      utils
    components/
    pages/
```

## 🛠 Tecnologias

* **Backend:** NestJS, Prisma, SQLite, Jest, OpenAI API, AI SDK
* **Frontend:** Angular, TypeScript, SCSS, Angular CDK (drag-and-drop)

## ⚡ Funcionalidades

* Criar, atualizar e deletar **cards**
* Criar, atualizar e deletar **columns**
* Automações via **chatbot**
* Testes unitários com **Jest**

## 📦 Endpoints Principais

| Método | Endpoint            | Descrição                    |
| ------ | ------------------- | ---------------------------- |
| POST   | /cards              | Cria um card                 |
| PATCH  | /cards/:id          | Atualiza um card             |
| DELETE | /cards/:id          | Deleta um card               |
| POST   | /columns            | Cria uma coluna              |
| GET    | /columns/with-cards | Busca colunas com seus cards |
| PATCH  | /columns/:id        | Atualiza uma coluna          |
| DELETE | /columns/:id        | Deleta uma coluna            |

## 💬 Como utilizar o chatbot

O **chatbot** foi criado para realizar automações. Você pode solicitar tarefas como:

* Criar um fluxo completo de gestão de projeto
* Deletar todas as colunas
* Outras automações relacionadas a cards e columns

Ele executará as ações automaticamente.

## 🔧 Configurações

### Backend

1. Crie um arquivo `.env` com as variáveis de API conforme o `.env.example`
2. O modelo de banco de dados está definido em `prisma/schema.prisma`
3. Para usar a OpenAI API via GitHub:

   * Acesse: [Azure OpenAI GPT-4o-mini](https://github.com/marketplace/models/azure-openai/gpt-4o-mini)
   * Clique em "Usar este modelo"
   * Crie seu token de acesso
  
### Frontend

1. Crie um arquivo environment.ts e environment.development.ts dentro da pasta environments e cole a estrutura do environment.example.ts


## 📫 Contato

Para dúvidas ou feedback, entre em contato via LinkedIn:
[https://www.linkedin.com/in/rafagfran/](https://www.linkedin.com/in/rafagfran/)
**email:** rafagfra@hotmail.com
**whatsapp:** 17 992849794