# Github App - Teste Field Control

SPA desenvolvida com Vue.js 3, que permite a busca de repositórios do Github e exibe as informações mais relevantes, como: título, descrição, tecnologias, estrelas, issues, etc.

## Execução do projeto

```
$ git clone git@github.com:lucas-soares-dev/valinor.git
$ git checkout github-app-lucas-soares

$ yarn install ou npm install
$ yarn dev ou npm run dev
```

## Execução dos testes

```
$ yarn test

ou

$ npm run test
```

## Tecnologias utilizadas

- Vue.js 3 - Utilizei para conhecer mais sobre essa nova versão do Vue, pois, até o momento havia desenvolvido aplicações utilizando somente Vue.js 2. Optei por utilizar o Vue pelo fato de ter um maior domínio sobre este framework.

- Vitest - Biblioteca de testes unitários recomendada na documentação do Vue.js.

- Bootstrap 4 - Utilizei somente a parte das classes para facilitar a estilização da aplicação. Não importei os scripts de funcionalidades para não ser necessário adicionar o JQuery, visto que, as interações necessárias no projeto eram relativamente simples. Inicialmente utilizei o Vuetify 3, porém, enfrentei algumas dificuldades.

- Pinia - Como já desenvolvi outros projetos utilizando Vuex, optei por utilizar o pinia para agregar conhecimento sobre essa biblioteca.

- Axios

- FontAwesome

## Princípios da engenharia de software

#### KISS - Keep It Simple, Stupid
Busco aplicar este conceito de "fazer o simples" para atender a real necessidade do projeto sem inserir complexidades desnecessárias.

#### DRY - Don't Repeat Yourself
A aplicação foi desenvolvida por meio de componentes que podem ser reutilizados quando necessário, evitando a duplicação de códigos.

#### SRP - Single Responsibility Principle
Cada um dos componentes e funções possuem sua própria responsabilidade.

## Principais desafios e problemas

Inicialmente planejei desenvolver a aplicação utilizando o Vuetify 3 como biblioteca de componentes e estilização, porém, enfrentei adversidades no funcionamento dos componentes, então para prosseguir com o desenvolvimento, resolvi utilizar o bootstrap 4.<br>
Além disso, um dos maiores desafios foi planejar a rotina para dedicar um certo tempo para o desenvolvimento do projeto.

## Melhorias

- Finalizar a implementação dos testes
- Tratamento das mensagens de erros
- Implementar filtros de ordenação dos repositórios
- Suporte a multi idiomas - Uma alternativa é utilizar a biblioteca i18n

## Informações adicionais

Link do app: https://github-app-lucas-soares.vercel.app