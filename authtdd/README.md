# Authentication - TDD  

## Sobre o projeto

O projeto é uma aplicação back end construída durante meu período de estudos sobre TDD.

A aplicação consiste em uma API para autenticação de usuários, o objetivo maior foi desenvolver testes antes de implementar as funcionalidades da aplicação, tornando o fluxo de desenvolvimento orientado a testes. As credenciais, token JWT e permissões do usuário são verificadas apartir de testes unitário e de integração.

# Tecnologias utilizadas
## Back end
- Node.js
- Express
- Sequelize
- JWT
- Bcrypt
## Testes
- Jest
- Factory Girl
- Faker
- Supertest
- SQLite
## Implantação em produção
- Banco de dados: Postgresql

# Como executar o projeto

## Back end
Pré-requisitos: Node.js / Yarn / PostgreSQL

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
