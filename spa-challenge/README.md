# SearchHub - Desafio da Field Control

Projeto de SPA, referente ao desafio intermediário, que consulta a API do GitHub e retorna repositórios.

## Funcionalidades
- Pesquisar repositórios na plataforma do GitHub;
- Filtrar resultados de pesquisa:
  - Mais relevantes (Padrão);
  - Mais avaliados;
  - Menos avaliados;
  - Mais forks;
  - Menos forks.
- Paginação de conteúdo com botões interativos;
- Opções de paginação (10/30/50/70/100 itens por página) sendo 10 por padrão;
- Quantidade de repositórios;
- Informações úteis de cada repositório:
  - Nome completo (incl. nome do usuário);
  - Descrição, se disponível;
  - Quantidade de estrelas;
  - Quantidade de forks;
  - Quantidade de issues;
  - Quantidade de watchers.
- Middleware de query (a query **q** é obrigatória);
- Interface em mobile first com responsividade para telas maiores;
- Efeito placeholder de loading (Semelhante ao FB/IG).

**Observações:** A API do GitHub permite apenas 1.000 resultados por consulta, ou seja, de uma busca com 2.000 respostas encontradas, apenas metade poderá ser consultada.

## Instalação

### NodeJS
O Node deve ser estar instalado na máquina que irá executar o projeto, de preferência
a versão LTS mais recente.

### Preparação do ambiente
**Dependências**
```bash
$ git clone https://github.com/willaug/valinor.git
$ cd valinor
```

**Instalação**
```bash
$ yarn
```
ou
```bash
$ npm i
```

**Execução**
```bash
$ yarn serve
```
ou
```bash
$ npm run serve
```

**Testes**
```javascript
$ yarn test-api // Testar API do GitHub
$ yarn test-repo // Testar repositórios da API do GitHub
$ yarn test-search // Testar página de pesquisa do Vue
$ yarn test-pagination // Testar função de paginação
```

## Ferramentas
- **NodeJS** - Servidor;
- **Babel** - Compilador de JavaScript;
- **Vue CLI** - Cliente do Vue;
- **Vue** - Framework reativo;
- **Vue Router** - Rotas reativas para Vue;
- **TypeScript** - Tipagens para JavaScript;
- **Jest** - estrutura de testes;
- **Supertest** - testes HTTP;
- **SASS** - pré-processador CSS;
- **ESLint com Airbnb** - StyleGuide;
- **Axios** - Cliente HTTP;
- **Qs** - Stringify para JS/TS;
- **Vue-click-outside** - Diretiva Vue para cliques fora de elementos;
- **V-wave** - Animação wave (Aquelas que o Google utiliza em seus botões);
- **Node-Emoji** - Conversor de nomes de emoji para emoji.



## Contato
Estou bem ansioso por um feedback, por conta disso, vocês podem me contactar por:
- E-mail: [contato@williamaugusto.com](mailto:contato@williamaugusto.com);
- Website: [williamaugusto.com](https://www.williamaugusto.com) (Recomendo conhecerem);
- Telefone: [17997299699](tel:5517997299699);

Caso queiram conhecer um pouco mais de mim, todos os meus projetos fixados no GitHub possui uma documentação sobre. 🧑‍💻