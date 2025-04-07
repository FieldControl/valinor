Kanban - Documentação do Projeto
1. Visão Geral
Este projeto consiste em um sistema Kanban, desenvolvido com as tecnologias Angular (frontend) e NestJS (backend). O objetivo do sistema é permitir a organização de tarefas por colunas, representando diferentes estágios como: "A Fazer", "Em Progresso" e "Concluído".

2. Tecnologias Utilizadas
Frontend:
-Angular 16 ou superior
-HTML, CSS, TypeScript

Backend:
-NestJS
-Node.js
-TypeScript
-PostgreSQL
-Prisma ORM (opcional)

3. Estrutura do Projeto
kanban-project/
├── frontend/        (Projeto Angular)
├── backend/         (Projeto NestJS)
├── README.md        (Documentação do Projeto)

4. Como Executar o Projeto
4.1 Pré-requisitos
Para executar o projeto, é necessário ter os seguintes softwares instalados:
-Node.js 18 ou superior
-npm ou yarn
-Angular CLI: npm install -g @angular/cli
-Nest CLI: npm install -g @nestjs/cli
-Banco de dados PostgreSQL (ou outro)
-(Opcional) Docker

4.2 Iniciando o Backend (NestJS)
Acesse a pasta do backend:
cd backend
Instale as dependências:

nginx
npm install

Inicie o servidor:
npm run start
O backend será iniciado na URL: http://localhost:3000

4.3 Iniciando o Frontend (Angular)
Acesse a pasta do frontend:
cd frontend
Instale as dependências:
npm install

Inicie o servidor:
npm run start
O frontend será iniciado na URL: http://localhost:4200

5. Como Executar os Testes
Backend (NestJS)
Para rodar os testes no backend, execute:
npm run test

Frontend (Angular)
Para rodar os testes no frontend, execute:
ng test

7. Endpoints da API
A seguir, a lista de endpoints REST disponíveis na API:

Método	Rota	Descrição
GET	/columns	Retorna todas as colunas com tarefas
POST	/columns	Cria uma nova coluna
POST	/tasks	Cria uma nova tarefa
PUT	/tasks/:id	Atualiza uma tarefa
DELETE	/tasks/:id	Remove uma tarefa
As rotas podem variar dependendo da implementação.

7. Funcionalidades Implementadas
Visualização de colunas e suas tarefas

Criação de colunas

Criação de tarefas

Atualização de tarefas

Exclusão de tarefas

(Em desenvolvimento) Funcionalidade de arrastar e soltar (drag and drop)

8. Observações Adicionais
Certifique-se de iniciar o backend antes do frontend.

A URL do backend utilizada no frontend é http://localhost:3000 (padrão do NestJS).

O layout da tela pode ser modificado nos arquivos .html e .css localizados na pasta src/app do frontend.

9. Autoria
Desenvolvedora Responsável:
Maria Eduarda
