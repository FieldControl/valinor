# Aplicação NestJS com MySQL

Este é um projeto de uma aplicação utilizando NestJS com integração a um banco de dados MySQL.

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

- Node.js
- NPM ou Yarn
- MySQL

## Instalação

### 1. Clonar o repositório

Primeiramente, clone o repositório do projeto para sua máquina local.

```bash
git clone https://github.com/Jucafleming/kanban.git
cd kanban
```

### 2. Instalar dependências

Instale as dependências do projeto usando NPM ou Yarn.

Com NPM:
```bash
npm install
```

Com Yarn:
```bash
yarn install
```

### 3. Configurar o banco de dados

Certifique-se de que o MySQL esteja rodando e crie um banco de dados para a aplicação.

```Mysql
CREATE DATABASE kanban;
```

### 4. Configurar variáveis de ambiente

Entre em `\src\app.module.ts` e mude as propriedades:

```
  username: 'root', // coloque seu username do Mysql
  password:'root',// sua senha
  database: 'kanban', // nome do schema que criou anteriormente
```


## 5. Executar a Aplicação

Para iniciar a aplicação em modo de desenvolvimento, utilize o seguinte comando:

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.



## 6. Estrutura do Projeto

A estrutura básica do projeto é a seguinte:

```
```
└── 📁src
    └── 📁app
        └── app.component.css
        └── app.component.html
        └── app.component.spec.ts
        └── app.component.ts
        └── app.config.ts
        └── app.routes.ts
        └── 📁core
            └── 📁components
                └── 📁header
                    └── header.component.css
                    └── header.component.html
                    └── header.component.spec.ts
                    └── header.component.ts
            └── 📁interceptor
                └── jwt.interceptor.spec.ts
                └── jwt.interceptor.ts
        └── 📁features
            └── 📁account
                └── 📁login
                    └── login.component.css
                    └── login.component.html
                    └── login.component.spec.ts
                    └── login.component.ts
                └── 📁register
                    └── register.component.css
                    └── register.component.html
                    └── register.component.spec.ts
                    └── register.component.ts
            └── 📁quadros
                └── 📁components
                    └── 📁add-card
                        └── add-card.component.css
                        └── add-card.component.html
                        └── add-card.component.spec.ts
                        └── add-card.component.ts
                    └── 📁add-quadro
                        └── add-quadro.component.css
                        └── add-quadro.component.html
                        └── add-quadro.component.spec.ts
                        └── add-quadro.component.ts
                    └── 📁edit-coluna
                        └── edit-coluna.component.css
                        └── edit-coluna.component.html
                        └── edit-coluna.component.spec.ts
                        └── edit-coluna.component.ts
                └── 📁detalhes
                    └── detalhes.component.css
                    └── detalhes.component.html
                    └── detalhes.component.spec.ts
                    └── detalhes.component.ts
                └── 📁lista
                    └── lista.component.css
                    └── lista.component.html
                    └── lista.component.spec.ts
                    └── lista.component.ts
        └── 📁shared
            └── 📁auth
                └── 📁guards
                    └── auth.guard.spec.ts
                    └── auth.guard.ts
            └── 📁services
                └── auth.service.spec.ts
                └── auth.service.ts
                └── card.service.spec.ts
                └── card.service.ts
                └── colunas.service.spec.ts
                └── colunas.service.ts
                └── 📁models
                    └── quadro.model.ts
                    └── user.model.ts
                └── quadro.service.spec.ts
                └── quadro.service.ts
                └── user.service.spec.ts
                └── user.service.ts
            └── 📁ui
                └── 📁confirm
                    └── confirm.component.css
                    └── confirm.component.html
                    └── confirm.component.spec.ts
                    └── confirm.component.ts
    └── 📁assets
        └── .gitkeep
    └── favicon.ico
    └── index.html
    └── main.ts
    └── styles.css
```
```

##  7. Tecnologias Utilizadas

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [MySQL](https://www.mysql.com/)

# Projeto Angular

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

- Node.js 
- NPM ou Yarn
- Angular CLI

## Instalação

### 1. Clonar o repositório

Primeiramente, clone o repositório do projeto para sua máquina local.

```bash
git clone https://github.com/Jucafleming/kanban.git
cd kanban
```

### 2. Instalar dependências

Instale as dependências do projeto usando NPM ou Yarn.

Com NPM:
```bash
npm install
```

Com Yarn:
```bash
yarn install
```

### 3. Servir a aplicação

Para iniciar a aplicação em modo de desenvolvimento, utilize o seguinte comando:

```bash
ng serve
```

A aplicação estará disponível em `http://localhost:4200`.


## Estrutura do Projeto

A estrutura básica do projeto é a seguinte:

```
└── 📁src
    └── 📁app
        └── app.component.css
        └── app.component.html
        └── app.component.spec.ts
        └── app.component.ts
        └── app.config.ts
        └── app.routes.ts
        └── 📁core
            └── 📁components
                └── 📁header
                    └── header.component.css
                    └── header.component.html
                    └── header.component.spec.ts
                    └── header.component.ts
            └── 📁interceptor
                └── jwt.interceptor.spec.ts
                └── jwt.interceptor.ts
        └── 📁features
            └── 📁account
                └── 📁login
                    └── login.component.css
                    └── login.component.html
                    └── login.component.spec.ts
                    └── login.component.ts
                └── 📁register
                    └── register.component.css
                    └── register.component.html
                    └── register.component.spec.ts
                    └── register.component.ts
            └── 📁quadros
                └── 📁components
                    └── 📁add-card
                        └── add-card.component.css
                        └── add-card.component.html
                        └── add-card.component.spec.ts
                        └── add-card.component.ts
                    └── 📁add-quadro
                        └── add-quadro.component.css
                        └── add-quadro.component.html
                        └── add-quadro.component.spec.ts
                        └── add-quadro.component.ts
                    └── 📁edit-coluna
                        └── edit-coluna.component.css
                        └── edit-coluna.component.html
                        └── edit-coluna.component.spec.ts
                        └── edit-coluna.component.ts
                └── 📁detalhes
                    └── detalhes.component.css
                    └── detalhes.component.html
                    └── detalhes.component.spec.ts
                    └── detalhes.component.ts
                └── 📁lista
                    └── lista.component.css
                    └── lista.component.html
                    └── lista.component.spec.ts
                    └── lista.component.ts
        └── 📁shared
            └── 📁auth
                └── 📁guards
                    └── auth.guard.spec.ts
                    └── auth.guard.ts
            └── 📁services
                └── auth.service.spec.ts
                └── auth.service.ts
                └── card.service.spec.ts
                └── card.service.ts
                └── colunas.service.spec.ts
                └── colunas.service.ts
                └── 📁models
                    └── quadro.model.ts
                    └── user.model.ts
                └── quadro.service.spec.ts
                └── quadro.service.ts
                └── user.service.spec.ts
                └── user.service.ts
            └── 📁ui
                └── 📁confirm
                    └── confirm.component.css
                    └── confirm.component.html
                    └── confirm.component.spec.ts
                    └── confirm.component.ts
    └── 📁assets
        └── .gitkeep
    └── favicon.ico
    └── index.html
    └── main.ts
    └── styles.css
```

## Tecnologias Utilizadas

- [Angular](https://angular.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [RxJS](https://rxjs.dev/)
