# Kanban Project

Este é um projeto de **Kanban Board** desenvolvido com o objetivo de ajudar na organização e gerenciamento de tarefas de forma simples e eficiente. O projeto é dividido em duas partes principais:

1. **Frontend**: Desenvolvido com **Angular**, onde o usuário pode interagir com as colunas e cards.
2. **Backend**: Desenvolvido com **NestJS** e utiliza **SQLite** como banco de dados para armazenar as informações das colunas e cards.

## Funcionalidades

- **Adicionar Colunas**: O usuário pode criar novas colunas para organizar os cards.
- **Adicionar Cards**: Dentro de cada coluna, é possível adicionar novos cards, cada um com título e descrição.
- **Exibição de Colunas e Cards**: As colunas e seus respectivos cards são exibidos na interface.

## Tecnologias Utilizadas

### Backend:
- **NestJS**: Framework para a criação de APIs RESTful.
- **SQLite**: Banco de dados leve e fácil de manusear para armazenar dados das colunas e cards.
  
### Frontend:
- **Angular**: Framework para a criação de SPAs (Single Page Applications), utilizado para construir a interface de usuário.
- **ngModel**: Para a vinculação de dados nos formulários.

## Como Rodar o Projeto

1. Backend
Navegue até o diretório do backend:
bash
cd backend
Instale as dependências:
bash
npm install
Rode o servidor do backend:
bash
npm run start
O servidor backend estará rodando em http://localhost:3000.

2. Frontend
Navegue até o diretório do frontend:
bash
cd frontend
Instale as dependências:
bash
npm install
Rode o servidor do frontend:
bash
npm run start
A aplicação frontend estará rodando em http://localhost:4200.

Estrutura do Projeto
Backend (NestJS)
src/app.controller.ts: Controlador principal da API.
src/app.service.ts: Serviço responsável pela lógica de negócio.
src/cards/cards.controller.ts: Controlador responsável pelas operações de cards.
src/cards/cards.service.ts: Serviço responsável pela manipulação dos cards.
src/columns/columns.controller.ts: Controlador responsável pelas operações de colunas.
src/columns/columns.service.ts: Serviço responsável pela manipulação das colunas.
Frontend (Angular)
src/app/app.component.ts: Componente principal do frontend.
src/app/app.component.html: HTML com a estrutura das colunas e cards.
src/app/app.component.css: Estilo básico para a aplicação.


Melhorias Futuras
Autenticação: Implementar uma tela de login com autenticação.
Responsividade: Tornar a interface mais responsiva para dispositivos móveis.
Edição de Cards/Colunas: Permitir a edição de cards e colunas já criados.
Exclusão de Cards/Colunas: Adicionar funcionalidade para excluir cards e colunas diretamente.
Contribuindo

Este projeto está licenciado sob a MIT License.
