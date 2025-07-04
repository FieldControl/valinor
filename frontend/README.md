# Frontend - Projeto Kanban

Este é o frontend do Projeto Kanban, desenvolvido com Angular.  
A aplicação consome a API do backend NestJS para oferecer uma interface moderna, responsiva e intuitiva para gerenciamento de tarefas em um estilo Kanban.

---

## Tecnologias utilizadas

- Angular 17  
- TypeScript    
- Angular Material  

---

## Estrutura do projeto

- **src/app/components**: componentes visuais reutilizáveis (cards, botões, colunas)  
- **src/app/services**: comunicação com a API (HTTP requests)  
- **src/app/models**: definição das interfaces e modelos (ex: Task)  
- **src/app/pages**: páginas principais com layout geral  
- **src/app/app.module.ts**: módulo principal que organiza os imports, components e serviços  

---

## Como rodar o projeto localmente

1. Navegue até a pasta do frontend

2. Instale as dependências do projeto: npm install

3. inicie o servidor: ng serve

---

## Funcionalidades Principais

1. Listagem de tarefas organizadas por status (ex: "A Fazer", "Em andamento", "Concluído")

2. Criação de novas tarefas com formulário interativo

3. Edição e exclusão de tarefas

4. Mudança de status via drag and drop (arrastar e soltar)

5. Comunicação com o backend em tempo real (via HTTP)

Autor
Pedro Capelin
Email: pedrocapelin13@gmail.com

