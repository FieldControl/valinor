# Kanban/Nest.JS

Este projeto foi desenvolvido com Angular para Front e Nest.JS para back, sistema consiste em criar colunas com tarefas.

## Funcionalidades

-  Adicionar tarefas em uma coluna com título e descrição 
-  Mover tarefas do jeito que quiser entre as colunas
-  Banco de dados em db.sqlite

## Tecnologias Utilizadas

- [Angular 17+](https://angular.io/) (Framework principal)
- [TypeScript](https://www.typescriptlang.org/) (Linguagem principal)
- [Angular Material](https://material.angular.io/) (Componentes de UI modernos e responsivos)
- [SQL.Lite](https://www.sqlite.org/) (Servidor para Banco de Dados)
- [Nest.JS](https://nestjs.com/) (Linguagem utilizada para back-end)
  
## Como rodar o projeto localmente
Siga os passos abaixo para executar o projeto em sua máquina local:

### 1. Clone o repositório

```bash
git clone https://github.com/Rafaamf/projeto-kanban
cd corpo #back
cd frente #front
```

### 2. Instale as dependências

```
npm install
npm install --save @nestjs/swagger swagger-ui-express
```

### 3. Inicie o back-end com SQL.Lite

```
npm run start:dev
```
O servidor estará disponível em [http://localhost:3000](http://localhost:3000)

### 4. Iniciar a aplicação no Angular 
Em outro terminal execute: 
```
ng serve --open
```
Abra seu navegador e acesse: [http://localhost:4200](http://localhost:4200)
