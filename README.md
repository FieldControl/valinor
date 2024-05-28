# Teste Técnico - Kanban - Field Control

Um modelo de Kanban Board básico para o teste técnico da Field Control para vaga de estágio.

## Para rodar o back-end:

Crie um banco de dados MySQL local, utilizando um usuário com senha, e coloque as conexões do banco no arquivo backend/src/app.module.ts

É necessário criar o banco antes de rodar ambos os ambientes!

```
cd backend/
npm i --save
npm run start:dev
```

## Para rodar o front-end:

```
cd frontend/
npm i --save
ng serve
```