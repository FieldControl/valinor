# Kanban Board - Teste de Programação

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## 📄 Descrição do Projeto

Este projeto é uma implementação de um quadro Kanban funcional, desenvolvido como parte de um teste de programação. O objetivo é demonstrar a habilidade de estruturar uma aplicação full-stack moderna, seguindo as boas práticas de desenvolvimento com Angular para o front-end e NestJS para o back-end.

A aplicação permite a visualização de colunas e cartões, e a criação de novos cartões em tempo real dentro de suas respectivas colunas.

## ✨ Funcionalidades

* **Visualização do Quadro:** Exibe colunas e os cartões contidos nelas, carregados a partir da API.
* **Criação de Cartões:** Permite adicionar novos cartões a qualquer coluna através de um formulário dinâmico.
* **Atualização em Tempo Real:** Novos cartões aparecem na interface instantaneamente após a criação, sem a necessidade de recarregar a página.

## 🛠️ Tecnologias Utilizadas

A aplicação é dividida em duas partes principais:

* **Back-end (API):**
    * **[NestJS](https://nestjs.com/):** Um framework Node.js progressivo para construir aplicações de servidor eficientes e escaláveis.
    * **[TypeScript](https://www.typescriptlang.org/):** Usado para adicionar tipagem estática ao JavaScript, aumentando a robustez e a manutenibilidade do código.
    * **Banco de Dados:** Para este teste, foi utilizada uma abordagem de "banco de dados" em memória para agilizar o desenvolvimento.

* **Front-end (UI):**
    * **[Angular](https://angular.io/):** Um framework baseado em componentes para construir aplicações web de página única (SPA).
    * **Arquitetura Standalone:** Utiliza a arquitetura de componentes autônomos, a abordagem mais moderna do Angular.
    * **TypeScript e CSS:** Para a lógica e estilização dos componentes.

## 🚀 Como Executar o Projeto

Para rodar este projeto localmente, você precisará ter o Node.js e o NPM instalados, bem como os CLIs do Angular e do NestJS.

```bash
# Instalar o Angular CLI globalmente
npm install -g @angular/cli

# Instalar o NestJS CLI globalmente
npm install -g @nestjs/cli
```

### 1. Clonando o Repositório

```bash
# Clone este repositório (substitua pela URL do seu repositório)
git clone [URL-DO-SEU-REPOSITORIO-GIT]

# Entre na pasta principal do projeto
cd [kanban]
```

### 2. Executando o Back-end (API)

O back-end precisa estar rodando para que o front-end possa buscar os dados.

```bash
# Abra um terminal na pasta raiz do projeto

# Navegue até a pasta da API
cd kanban-api

# Instale as dependências
npm install

# Inicie o servidor em modo de desenvolvimento
npm run start:dev
```
> O servidor do back-end estará rodando em `http://localhost:3000`.

### 3. Executando o Front-end (UI)

Abra um **novo terminal** para rodar o front-end simultaneamente.

```bash
# Abra um segundo terminal na pasta raiz do projeto

# Navegue até a pasta da UI
cd kanban-ui

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento do Angular
ng serve
```
> A aplicação estará acessível em `http://localhost:4200` no seu navegador.

## API Endpoints

A API atualmente expõe os seguintes endpoints principais:

* `GET /columns`: Retorna a lista de todas as colunas e os cartões aninhados.
* `POST /cards`: Cria um novo cartão em uma coluna específica.

## 📈 Próximos Passos e Melhorias Futuras

Para evoluir o projeto, os seguintes passos poderiam ser implementados:

* [ ] Implementar a criação e exclusão de colunas.
* [ ] Implementar a funcionalidade de arrastar e soltar (Drag and Drop) para mover cartões entre colunas.
* [ ] Adicionar testes unitários (Jest) e end-to-end (Cypress/Playwright) para garantir a robustez.
* [ ] Fazer o deploy da aplicação em um serviço de nuvem (ex: Heroku para o back-end e Netlify/Vercel para o front-end).
* [ ] Substituir o banco de dados em memória por uma solução persistente como SQLite ou PostgreSQL com TypeORM.
* [ ] Implementar edição e exclusão de cartões.

## 👨‍💻 Autor

**[Pedro Cassiano e muita I.A]**

* **LinkedIn:** https://www.linkedin.com/in/pedro-cassiano/
* **GitHub:** https://github.com/cassiano-coding