# Kanban - NestJS & Angular
================================

Este repositório contém o código fonte para uma aplicação Kanban construída com NestJS (backend) e Angular (frontend). A aplicação utiliza TypeORM para interagir com um banco de dados MySQL.

## Visão Geral
------------

Este projeto é uma aplicação Kanban que permite aos usuários criar, gerenciar e mover cartões entre colunas dentro de quadros. A aplicação foi desenvolvida com foco em organização e colaboração, permitindo que equipes trabalhem juntas em projetos de forma eficiente.

## Tecnologias
------------

* **Backend**: NestJS
* **Frontend**: Angular
* **Banco de Dados**: MySQL
* **ORM**: TypeORM

## Documentação
-------------

### NestJS

* [Documentação oficial do NestJS](https://docs.nestjs.com/)
* [Guia de início rápido do NestJS](https://docs.nestjs.com/first-steps)

### Angular

* [Documentação oficial do Angular](https://angular.io/docs)
* [Guia de início rápido do Angular](https://angular.io/start)

### TypeORM

* [Documentação oficial do TypeORM](https://typeorm.io/#/)
* [Guia de início rápido do TypeORM](https://typeorm.io/#/getting-started)

## Instalação
------------

### Clone o repositório
git clone https://github.com/Geovana-OliveiraSilva/kanban.git

## Configurando o XAMPP para o desenvolvimento
---------------------------------------------

### Baixe e instale o XAMPP

1. Acesse o site oficial do XAMPP ([https://www.apachefriends.org/](https://www.apachefriends.org/)) e baixe a versão mais recente para o seu sistema operacional.
2. Execute o instalador e siga as instruções na tela.

### Inicie o servidor MySQL

1. Abra o painel de controle do XAMPP.
2. Clique no botão "Iniciar" ao lado do serviço "MySQL".
3. Conecte-se ao servidor MySQL local (localhost).

### Crie o banco de dados

1. Crie o banco de dados com o nome `kanban-teste` utilizando o seguinte comando SQL:CREATE DATABASE `kanban-teste` ;
2. (O TypeORM criará as tabelas automaticamente quando o servidor NestJS for iniciado.)

## Executando a aplicação
-------------------------

### Inicie o servidor backend
npm run start:dev

### Inicie o servidor frontend
npm ng serve ou npm run start

### Video mostrando como usar no assets
video-como-usar-site.mp4