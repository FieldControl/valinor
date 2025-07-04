# Backend - Projeto Kanban

Este é o backend do Projeto Kanban, desenvolvido com NestJS.  
A API foi construída com foco em simplicidade, organização e escalabilidade, oferecendo um CRUD completo para gerenciamento de tarefas.

---

## Tecnologias utilizadas

- NestJS  
- TypeScript  
- Node.js  
- Class Validator (validação de dados)  
- Swagger (opcional, para documentação da API)

---

## Estrutura do projeto

- **src/modules/tasks**: módulo principal de tarefas  
- **src/controllers**: define os endpoints REST da aplicação  
- **src/services**: regras de negócio e lógica da aplicação  
- **src/entities**: modelos de dados (entidades)  
- **main.ts**: ponto de entrada da aplicação  

---

## Funcionalidades da API

A API oferece as seguintes operações:

- `GET /tasks` — Listar todas as tarefas  
- `GET /tasks/:id` — Buscar uma tarefa por ID  
- `POST /tasks` — Criar uma nova tarefa  
- `PATCH /tasks/:id` — Atualizar parcialmente uma tarefa  
- `DELETE /tasks/:id` — Deletar uma tarefa  

Todas as rotas seguem o padrão RESTful e retornam respostas em formato JSON.

---

## Como rodar o projeto localmente

1. Acesse a pasta do backend:

2. Instale as dependências do projeto: npm install

3. Inicie a aplicação: npm run start:dev

---

## Validações 

As requisições são validadas com base em DTOs que usam validações para garantir que os dados inseridos sejam consistentes.
Caso os dados estejam incorretos, a API retorna mensagens claras de erro.

Autor
Pedro Capelin
Email: pedrocapelin13@gmail.com