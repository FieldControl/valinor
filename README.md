## Explore Repositórios e Usuários do GitHub

Encontre os repositórios mais populares, descubra desenvolvedores talentosos e acompanhe o código-fonte de projetos emocionantes.

Este projeto foi desenvolvido em resposta a um desafio, construindo um SPA para consumir uma API pública do GitHub com listagem, visualização individual e paginação de resultados. Utilizei o [Angular], foi meu primeiro projeto com o framework e gostei bastante da experiência, apesar de algumas limitações da API do GitHub. O resultado me agradou bastante, pretendo continuar evoluindo o aplicativo com correções e melhorias.

![Lista](assets/img/list.png)
![Visualização Individual](assets/img/single.png)

## Demo

[Ver Demo](https://github-api-search-gamma.vercel.app/)

## Próximos Passos

- Exibir mapa de contribuições do perfil.
- Exibir quantidade total de commits do repositório.
- Exibir quantidade de pull request dos repositórios.
- Usar autenticação na API para aumentar o limite de 10 solicitações por hora.

## Stack Utilizada

Desenvolvi o projeto utilizando Angular CLI 16.2.7, finalizado na versão 17.0.2. Utilizei HTML, CSS e a biblioteca de ícones [@ng-icons](https://github.com/ng-icons/ng-icons).

## Executando o Projeto

Clone o repositório:

```console
git clone https://github.com/LeandroJMartin/github-api-search.git
```

Instale as dependências:

```console
npm i
```

Para rodar o servidor de desenvolvimento:

```console
ng serve
```

navegue até `http://localhost:4200/`.
