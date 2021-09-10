# Entrega Front-End-Challenge

O App está rodando nesta URL:

https://github-f9w1l3.stackblitz.io/?q=node&page=1

### Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou

* Angular v12 no frontend.
* sistema de grid do bootstrap.
* componentes do angular materials para exibir os dados.
* ngxtoastr para exibir toasts de erro.
* normalize para dar reset no css dos browsers.
* FontAwesome, usado para mostrar icones.
* Angular Emojify, usado para mostrar os emojis que tem na descrição de alguns repositórios.
* VS Code.
	
### Porque você optou pela tecnologia X e não a Y

Optei pelo Angular pois é o framework que possuo melhor dominio, e por tambem ser um framework de mercado é muito fácil encontrar solução para dúvidas ou problemas na web, na responsividade utilizei apenas o grid do bootstrap para alinhar e deixar responsivo o app.

### Desafios e problemas que você enfrentou e como você resolveu.

Um problema que encontrei é que a API do github limita os resultados a até 1000

  ```sh 
  https://api.github.com/search/repositories?q=node&page=41&per_page=25
  {
    "message": "Only the first 1000 search results are available",
    "documentation_url": "https://developer.github.com/v3/search/"
  }
  ```

Outro ponto é que há um limite de 30 requests em um determinado intervalo

o hash utilizado no interceptor NÃO é minha senha do github é um hash gerado por eles

### O que você entende que pode ser melhorado e como fazer isso

 a parte de testes acredito que seja algo que falte não sei como implementar isso.

[EMAIL](mailto:felipe.carlos1504@outlook.com) 17-988084541
[LinkedIn Felipe Santos](https://www.linkedin.com/in/felipecarlos1504/)

# Angular App

Dar clone nesse Projeto e logo após `npm i` para instalar a última versão das dependências do app e iniciar o desenvolvimento.

## Development server

Digite `npm start` para começar. O browser será aberto automaticamente em `http://localhost:4200/`.

## Interceptors

Na raiz do app há um interceptor na pasta `interceptors` o arquivo `custom-http.interceptor.ts` para que você possa interceptar os requests feitos pela sua aplicação,
é possível adicionar/remover headers, exibir mensagens de erro padrão baseado no retorno do request/response e etc. Para mais informações visite a documentação do angular:

* [Intercepting-requests-and-responses](https://angular.io/guide/http#intercepting-requests-and-responses) - Angular.io.

## Frameworks CSS

Neste projeto está sendo utilizado o sistema de grid do bootstrap, apenas ele, caso não queira utilizá-lo digite `npm rm bootstrap` e remova o import no arquivo `angular.json`.

* [Docs Bootstrap Grid](https://getbootstrap.com/docs/4.1/layout/grid/) - Grid Docs.

O `normalize.scss` também está sendo utilizado é um reset de alguns elementos que não funcionam corretamente em alguns browsers entre outros, para mais detalhes visitar o repositório.

* [Normalize](https://github.com/necolas/normalize.css) - Repositório normalize.css.

```sh
  "styles": [
    "src/styles.scss",
    "./node_modules/bootstrap/dist/css/bootstrap-grid.min.css",
    "./node_modules/normalize.css/normalize.css"
  ],
```