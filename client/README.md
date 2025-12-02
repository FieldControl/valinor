# Ferramentas utilizadas
Framework: Angular (v17+ Standalone Components)
Estilização: Tailwind CSS v3
Gerenciamento de Estado/Dados: Apollo Client (GraphQL)
Interatividade: Angular CDK (Drag and Drop)
Testes: Jasmine/Karma (Unitários) e Cypress (E2E)

## Setup do projeto
# Instale as dependências
```bash
$ npm install
```

## Rode o projeto 
```bash
$ ng serve
```

    OR

```bash
$ npm run start
```

## Testes
Nesse projeto, os testes unitarios e de integração foram feitos com os pacotes padrões do Angular (Jasmine) nos arquivos spec.ts. Para roda-los, basta usar o comando a baixo.

```bash
$ npm run test
```

Há tambem um teste e2e utilizando Cypress (15.7.0), que testa o hanshake entre frontend e backend. Para roda-lo, é necessário do frontend e do backend rodando. Após se certificar que ambos estão rodando corretamente, abra um novo terminal, na pasta client, e digite:

```bash
$ npx cypress open
```

Deve abrir uma janela do Cypress, selecione o teste E2E e depois o navegador que voce utilize. Após isso, deve abrir uma pagina web, no navegador escolhido, selecione o arquivo "spec.cy.ts" para rodar o teste completo do fluxo da aplicação. 