# Entrega

- Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou
	Utilizei Angular v9 no frontend, sistema de grid do bootstrap e o normalize para dar reset no css dos browsers, como ferramenta o bom e velho VS Code.
- Porque você optou pela tecnologia X e não a Y
	Optei pelo Angular pois é o framework que possuo melhor dominio, e por tabem ser um framework de mercado é muito fácil encontrar solução para dúvidas ou problemas na web, na responsividade utilizei apenas o grid do bootstrap para alinhar e deixar responsivo o app.
- Desafios e problemas que você enfrentou e como você resolveu.
	Não houve um grande desafio pois estou acostumado a desenvolver apps usando o angular, o bom do desafio é sempre ir revisitando coisas que são pontuais para resolver determinado problema, como o loading ao carregar a página já sabia como faria porém não lembrava tive que verificar a melhor maneira.

	Um problema que encontrei é que a API do github limita os resultados a até 1000

  ```sh 
  https://api.github.com/search/repositories?q=node&page=41&per_page=25
  {
    "message": "Only the first 1000 search results are available",
    "documentation_url": "https://developer.github.com/v3/search/"
  }
  ```

  o hash utilizado no interceptor NÃO é minha senha do github é um hash gerado por eles
- O que você entende que pode ser melhorado e como fazer isso
	 a parte de testes acredito que seja algo que falte não sei como implementar isso.

email: felipe.santos1504@outlook.com 17-988084541
[LinkedIn Felipe Santos](https://www.linkedin.com/in/felipecarlos1504/)

# Angular App

Dar clone nesse Projeto e logo após `npm i` para instalar a última versão das dependências do app e iniciar o desenvolvimento.

## Development server

Digite `npm start` para começar. O browser será aberto automaticamente em `http://localhost:4200/`.

## HMR

Esse app está configurado para utilizar o HMR (Hot Module Reload) para recarregar apenas os arquivos alterados não fazendo o reload da aplicação toda, assim preservando o seu estado ao alterar arquivos.

* [Tutorial HMR](https://codinglatte.com/posts/angular/enabling-hot-module-replacement-angular-6/)

## Paths

Ao adicionar modulos certifique-se de adicionar seu caminho aos paths do arquivo `tsconfig.json` para simplificar os caminhos dos imports.

Reinicie sua IDE para certificar de que os paths serão reconhecidos.

```sh 
"paths": {
      "core/*": ["src/app/core/*"],
      "guards/*": ["src/app/guards/*"],
      "feature/*": ["src/app/feature/*"],
      "shared/*": ["src/app/shared/*"]
    }
```

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

## Estrutura de Arquivos

As pastas estão organizadas desta maneira, cada módulo tem suas pastas `component`, `directives`, `models`, `pages`, `pipes` e `services`, dentro das pastas existe um arquivo `index.ts` para exportar os arquivos da pasta para deixar mais simples muitos imports.

Quanto ao `shared` module não está pronto para que se tenha rotas nele, por não fazer sentido, porém caso seja util para você basta ter como base o `feature` module para criar as rotas.

```sh 
📦src
 ┣ 📂app
 ┃ ┣ 📂animations
 ┃ ┣ 📂core
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┣ 📂directives
 ┃ ┃ ┣ 📂models
 ┃ ┃ ┣ 📂pages
 ┃ ┃ ┣ 📂pipes
 ┃ ┃ ┣ 📂services
 ┃ ┃ ┣ 📜core.component.ts
 ┃ ┃ ┗ 📜core.module.ts
 ┃ ┣ 📂guards
 ┃ ┃ ┗ 📂auth
 ┃ ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📂directives
 ┃ ┃ ┃ ┣ 📂models
 ┃ ┃ ┃ ┣ 📂pages
 ┃ ┃ ┃ ┣ 📂pipes
 ┃ ┃ ┃ ┣ 📂services
 ┃ ┃ ┃ ┣ 📜auth-routing.module.ts
 ┃ ┃ ┃ ┣ 📜auth.guard.ts
 ┃ ┃ ┃ ┗ 📜auth.module.ts
 ┃ ┣ 📂interceptors
 ┃ ┣ 📂feature
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┣ 📂directives
 ┃ ┃ ┣ 📂models
 ┃ ┃ ┣ 📂modules
 ┃ ┃ ┣ 📂pages
 ┃ ┃ ┣ 📂pipes
 ┃ ┃ ┣ 📂services
 ┃ ┃ ┣ 📜feature-root.component.html
 ┃ ┃ ┣ 📜feature-root.component.scss
 ┃ ┃ ┣ 📜feature-root.component.ts
 ┃ ┃ ┣ 📜feature-routing.module.ts
 ┃ ┃ ┗ 📜feature.module.ts
 ┃ ┗ 📂shared
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┣ 📂directives
 ┃ ┃ ┣ 📂models
 ┃ ┃ ┣ 📂pages
 ┃ ┃ ┣ 📂pipes
 ┃ ┃ ┣ 📂services
 ┃ ┃ ┗ 📜shared.module.ts
 ┃ ┣ 📜app-routing.module.ts
 ┃ ┣ 📜app.component.ts
 ┃ ┗ 📜app.module.ts
 ┣ 📂assets
 ┣ 📂environments
 ┣ 📂themes
```