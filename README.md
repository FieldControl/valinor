# FielControl - Teste para vaga Desenvolvedor Front-End

[Link para visualizar a aplicação](https://ingrid-valinor.surge.sh/)

## Pré-requisitos

- NodeJs

## Como rodar o projeto

- Instale as dependências com `yarn` ou `npm install`
- Faça uma cópia do arquivo `.env.example`, preencha os dados e renomeie a cópia para `.env`
- Rode a aplicação usando o comando `yarn start` ou `npm start`

## Testes unitários

- Para rodar os testes, execute o comando `yarn test`
- Para obter o relatório de cobertura de código, execute o comando `yarn test --coverage`

## Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou

- [ReactJS](https://pt-br.reactjs.org/docs/getting-started.html)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Axios](https://axios-http.com/docs/intro)
- [Styled Components](https://styled-components.com/docs)
- [DayJS](https://day.js.org/)
- [React Paginate](https://www.npmjs.com/package/react-paginate)

## Quais princípios da engenharia de software que você usou?

Os príncipios que utilizei foram os de Clean Code, buscando criar variáveis com nomes autoexplicativos, além de seguir o princípio DRY (Don't Repeat Yourself).

## Desafios e problemas que você enfrentou e como você resolveu

Um problema que enfrentei foi com o controle de input da busca, tendo em vista que a cada letra digitada, uma requisição estava sendo feita, o que poderia prejudicar a performance. Para resolver isso, pesquisei e descobri a função `debounce`, que me permite controlar o intervalo mínimo para executar uma função.

## O que você entende que pode ser melhorado e como fazer isso

Acredito que para uma implementação futura, o filtro lateral poderia ser uma boa ideia. Nesse momento não implementei por questões de tempo e porque exigiria criar um componente para cada filtro, visto que para cada um, as informações recebidas via requisição são diferentes, assim como o layout difere bastante.
Outro ponto a ser melhorado são os testes, onde eu poderia criar testes end to end utilizando Cypress e criando componentes mais fáceis de testar.
