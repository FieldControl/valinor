# Kanban App

Este é um aplicativo Kanban desenvolvido usando Angular com Tailwind CSS para o frontend e NestJS com SQLite para o backend.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (v14.x ou superior)
- Angular CLI
- NestJS CLI
- SQLite

## Configuração do Backend (NestJS)

1. **Instalação das Dependências:**    
    ```bash
    cd backend npm install
    ```
    
2. **Configuração do Banco de Dados:**
    
    Certifique-se de que o arquivo `kanban.db` esteja presente no diretório `backend/db/`. Caso não exista, crie o arquivo SQLite e as tabelas necessárias utilizando o script apropriado.
    
3. **Execução do Servidor:**
    ```bash
    npm run start:dev
    ```
    
    O servidor estará acessível em `http://localhost:3000`.

## Configuração do Frontend (Angular com Tailwind CSS)

1. **Instalação das Dependências:**
    
    ```bash
    cd frontend npm install
    ```
    
2. **Execução do Servidor de Desenvolvimento:**
    
    ```bash
    npm start
    ```
    
    O frontend estará acessível em `http://localhost:4200`.
    

## Funcionalidades

- **Colunas e Tarefas:** Visualização e manipulação de colunas e tarefas em um quadro Kanban.
- **Drag and Drop:** Movimentação de tarefas entre colunas usando funcionalidade de arrastar e soltar.
- **CRUD Completo:** Criação, leitura, atualização e exclusão de colunas e tarefas.

## Contribuição

Contribuições são bem-vindas! Para mudanças importantes, abra um problema primeiro para discutir o que você gostaria de mudar.

## Licença

Este projeto está licenciado sob a MIT License.