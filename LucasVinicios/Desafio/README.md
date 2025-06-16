# Projeto Kanban

Este projeto é um sistema Kanban com frontend em Angular e backend em NestJS.

## Estrutura do Projeto

- **kanban-frontend**: Aplicação Angular que gerencia a interface do usuário.
  - **src/app**: Contém os componentes, serviços e modelos do frontend.
  - **src/styles**: Arquivos de estilo e temas.
  - **src/index.html**: Ponto de entrada HTML.
  - **src/main.ts**: Ponto de entrada TypeScript.

- **kanban-backend**: API NestJS que fornece os endpoints para gerenciar quadros, colunas, cartões e autenticação.
  - **src/board**: Gerencia os quadros.
  - **src/column**: Gerencia as colunas.
  - **src/card**: Gerencia os cartões.
  - **src/board-members**: Gerencia os membros dos quadros.
  - **src/auth**: Gerencia a autenticação e autorização.
  - **src/entities**: Define as entidades do banco de dados.

## Pré-requisitos

- Node.js (versão LTS recomendada)
- npm (gerenciador de pacotes do Node.js)

## Instalação

### Backend (NestJS)

1. Navegue até o diretório do backend:
   ```bash
   cd kanban-backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start:dev
   ```

   O backend estará disponível em `http://localhost:3000`.

### Frontend (Angular)

1. Navegue até o diretório do frontend:
   ```bash
   cd kanban-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

   O frontend estará disponível em `http://localhost:4200`.

## Testes

### Backend

Para executar os testes do backend, use o seguinte comando:
```bash
npm test
```

### Frontend

Para executar os testes do frontend, use o seguinte comando:
```bash
npm test
```

## Funcionalidades

- **Quadros (Boards)**: Crie, visualize, atualize e remova quadros.
- **Colunas**: Gerencie colunas dentro de um quadro.
- **Cartões**: Adicione, edite, mova e remova cartões entre colunas.
- **Membros do Quadro**: Adicione e remova membros de um quadro.
- **Autenticação**: Sistema de login e registro de usuários.

## Tecnologias Utilizadas

- **Frontend**: Angular, Bootstrap, RxJS
- **Backend**: NestJS, TypeORM, SQLite, Passport (JWT)

## Observações

- O backend utiliza SQLite como banco de dados.
- O frontend se comunica com o backend através de uma API REST.
- Certifique-se de que o backend esteja rodando antes de iniciar o frontend para evitar erros de conexão. 