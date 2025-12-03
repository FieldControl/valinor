## Ferramentas utilizadas
Node.js (v18 ou superior)

# Backend
Framework: NestJS (Node.js)
API: GraphQL (Code First Approach)
Banco de Dados: PostgreSQL (via Docker)
ORM: Prisma (v5)
Testes: Jest (Unitários e E2E)

# Frontend
Framework: Angular (v17+ Standalone Components)
Estilização: Tailwind CSS v3
Gerenciamento de Estado/Dados: Apollo Client (GraphQL)
Interatividade: Angular CDK (Drag and Drop)
Testes: Jasmine/Karma (Unitários) e Cypress (E2E)

## Setup do projeto
# Configuração do Backend
No terminal, navegue até a pasta do backend (/server):

# 1. Instale as dependências
```bash
$ npm install
```

# 2. Suba o Banco de Dados (Docker)
```bash
$ docker-compose up -d
```

# 3. Gere os artefatos do Prisma (Tipagem)
```bash
$ npx prisma generate
```

# 4. Rode as migrations para criar as tabelas
```bash
$ npx prisma migrate dev --name init
```

# Configuração do Frontend
Em um novo terminal, navegue até a pasta do frontend (/client):

# Instale as dependências

```bash
$ npm install
```


## Executando o projeto

# Backend (/sever)
```bash 
$ npm run start
```

      OU

```bash
$ npm run start:dev
```

# Frontend (/client)
```bash
$ ng serve
```

      OU

```bash
$ npm run start
```

A aplicação estará disponível em http://localhost:4200

## Testes

# Testes unitários do backend
Nesse projeto, foi utilizado Jest como ferramenta de testes, com o comando a baixo, é verificado, toda a integração, e a interidade, dos componentes do backend.
```bash
$ npm run test
```

# Testes e2e do backend
Há também, um teste E2E, que testa a conexão com o banco de dados, portanto, ele ira salvar arquivos no banco de dados.
```bash
$ npm run test:e2e
```

# Testes unitários do frontend
Nesse projeto, os testes unitarios e de integração foram feitos com os pacotes padrões do Angular (Jasmine) nos arquivos spec.ts. Para roda-los, basta usar o comando a baixo.

```bash
$ npm run test
```

# Teste e2e do frontend
Há tambem um teste e2e utilizando Cypress (15.7.0), que testa o hanshake entre frontend e backend. Para roda-lo, é necessário do frontend e do backend rodando. Após se certificar que ambos estão rodando corretamente, abra um novo terminal, na pasta client, e digite:

```bash
$ npx cypress open
```

Deve abrir uma janela do Cypress, selecione o teste E2E e depois o navegador que voce utilize. Após isso, deve abrir uma pagina web, no navegador escolhido, selecione o arquivo "spec.cy.ts" para rodar o teste completo do fluxo da aplicação. 
