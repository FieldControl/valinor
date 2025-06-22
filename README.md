
# Kanban Board - Angular + NestJS

Este projeto é um quadro Kanban simples desenvolvido com Angular no front-end e NestJS no back-end. Ele permite criar, listar, atualizar status e excluir tarefas em três estados: A Fazer, Em Progresso e Concluída.

## 🛠 Tecnologias Utilizadas

- **Front-end:** Angular
- **Back-end:** NestJS
- **Banco de Dados:** SQLite (via TypeORM)

## ⚙️ Funcionalidades

- Criar novas tarefas com título e descrição
- Exibir tarefas separadas por status (`OPEN`, `IN_PROGRESS`, `DONE`)
- Atualizar status de tarefas com apenas um clique
- Excluir tarefas
- Comunicação entre front-end e back-end via HTTP

## 📦 Instalação e Execução

### 🔧 Back-end

1. Acesse a pasta do back-end:
   ```bash
   cd backend

2. Instale as dependências:

   ```bash
   npm install

3. Execute o servidor:

   ```bash
   npm run start:dev

O servidor será iniciado em: `http://localhost:3000`

### 💻 Front-end

1. Acesse a pasta do front-end:

   ```bash
   cd frontend

2. Instale as dependências:

   ```bash
   npm install

3. Inicie a aplicação Angular:

   ```bash
   ng serve

A aplicação estará disponível em: `http://localhost:4200`

> **Nota:** Certifique-se de que o CORS esteja habilitado no back-end para permitir a comunicação com o Angular.

## 🧪 Testes

* Os testes unitários estão presentes nos arquivos `task.controller.spec.ts` e `task.service.spec.ts`.
* Para rodar os testes:

  ```bash
  npm run test



## ✨ Visual

A aplicação exibe três colunas (A Fazer, Em Progresso, Concluída) onde as tarefas são movidas com botões. O visual pode ser facilmente estilizado via CSS.

## 📌 Considerações

* Projeto ideal para aprendizado de Angular + NestJS.
* Pode ser estendido com autenticação, persistência em nuvem, e responsividade mobile.


Feito com ❤️ por Sara Monique

