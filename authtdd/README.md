# Authentication - TDD  

## Sobre o projeto

O projeto é uma aplicação back end construída durante meu período de estudos sobre TDD.

A aplicação consiste em uma API para autenticação de usuários, onde o usuário faz uma requisição com seus dados de acesso, as informações fornecidas são consultadas em um banco de dados, se os dados estiverem corretos uma sessão será iniciada e um token JWT será gerado. O processo de autenticação será realizado quando o usuário tentar acessar as rotas restritas da aplicação, se o token do usuário for válido seu acesso será liberado.

O projeto foi construido utilizando a prática do TDD (Desenvolvimento orientado por testes) com testes unitários e de inetgração.

# Tecnologias utilizadas
## Back end
- Node.js
- Express
- Sequelize
- JWT
- Bcrypt
## Testes
- Jest
- Supertest
- Faker
## Implantação em produção
- Banco de dados: Postgresql

# Como executar o projeto

## Back end
Pré-requisitos: Node.js 14.17 / Yarn 1.22 / PostgreSQL

```bash
# clonar repositório
git clone https://github.com/brunobiasi/valinor.git

# entrar na pasta do projeto
cd authtdd

# instalar dependências
yarn install

# executar o projeto
yarn start
```

## Testes
```bash
# executar os testes
yarn test
```
