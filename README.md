# Kanban Board

Este é um projeto de **Kanban Board** desenvolvido com o objetivo de ajudar na organização e gerenciamento de tarefas de forma simples e eficiente. O projeto é dividido em duas partes principais:

1. **Frontend**: Desenvolvido com **Angular**, onde o usuário pode interagir com as colunas e cards.
2. **Backend**: Desenvolvido com **NestJS** e utiliza **SQLite** como banco de dados para armazenar as informações das colunas e cards.

Requisitos:

- Angular CLI
- Node.js
- - SQLite
- NestJS CLI

## Configuração do Backend

  Navegue até o diretório do backend:
  
    ```bash
    cd backend
    ```
    ```bash
    npm install
     ```
3. **Execução do Servidor:**
    ```bash
    npm run start
    ```
    
    O servidor estará acessível em `http://localhost:3000`.

## Configuração do Frontend 

Navegue até o diretório do frontend:
    
    ```bash
    cd frontend
    ```
    ```bash
     npm install
     ```
2. **Execução do Servidor:**
    
    ```bash
    npm run start
    ```
    
    O frontend estará acessível em `http://localhost:4200`.
    

## Funcionalidades

- **Adicionar Colunas**: O usuário pode criar novas colunas para organizar os cards.
- **Adicionar Cards**: Dentro de cada coluna, é possível adicionar novos cards, cada um com título e descrição.
- **Exibição de Colunas e Cards**: As colunas e seus respectivos cards são exibidos na interface.

## Licença

Este projeto está licenciado sob a MIT License.
