# Kanban Board Challenge

Este projeto é uma aplicação de Kanban desenvolvida como parte de um desafio técnico para a Field. O sistema é composto por um frontend em Angular e um backend em NestJS, permitindo a criação, edição, movimentação e remoção de colunas e cartões.

## Tecnologias Utilizadas

- **Frontend:** Angular 20+
- **Backend:** NestJS 11+, Knex, SQLite3

## Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/seu-repo.git
   cd seu-repo
   ```

2. Instale as dependências do backend e frontend:
   ```sh
   cd packages/API
   npm install
   cd ../Client
   npm install
   ```

### Rodando o Backend

1. No diretório `packages/API`, execute as migrações do banco:
   ```sh
   npm run migrate:latest
   ```

2. Inicie o servidor NestJS:
   ```sh
   npm run start
   ```
   O backend estará disponível em `http://localhost:3000`.

### Rodando o Frontend

1. No diretório `packages/Client`, inicie o servidor Angular:
   ```sh
   npm run start
   ```
   Acesse `http://localhost:4200` no navegador.

## Estrutura do Projeto

- `packages/API`: Código-fonte do backend (NestJS)
- `packages/Client`: Código-fonte do frontend (Angular)
- `assets/`: Imagens e recursos estáticos

## Funcionalidades

- Adicionar, renomear, mover e remover colunas
- Adicionar, renomear, mover e remover cartões
- Persistência dos dados em banco SQLite

## TODO

- Corrigir retorno dos endpoints da API
- Melhorar tratamento de erros na API
- Adicionar tipos ao Knex
- Melhorar estilo da tela

---

> Projeto desenvolvido para o processo seletivo da Field