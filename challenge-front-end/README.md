# Angular App

Sugestão de arquitetura para App Angular 8 (v 8.2.14).

Dar clone nesse Projeto e logo após `npm i` para instalar a última versão das dependências do app e iniciar o desenvolvimento.

## Development server

Digite `npm start` para começar. O browser será aberto automaticamente em `http://localhost:4200/`.

## Compilação Dinâmica de Módulos
* [Tutorial Compilação de Módulos](https://dev.to/binarysort/manually-lazy-load-components-in-angular-8-ffi)

Agora é possível compilar módulos dinamicamente (adaptei a solução acima para o projeto base).

Primeiro exportar a variável de rotas que possuam módulos por ex: `app\app-routing.module.ts` tem o seguinte módulo com o `path: 'feature'` carregado por rota:

```sh
export const appRoutes: Routes = [
  { path: 'feature', loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)},
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];
```

usar o *spread operator* na propriedade `appRoutes` para não ter que ficar digitando mais de uma vez a rota ou em qualquer outro **módulo** de rotas que seu app possuír para que o processo seja "automático". 
arquivo: `app\lazy-widgets.ts`
```sh
  // This will create a dedicated JS bundle for lazy module
  export const lazyWidgets: Routes = [
      ...appRoutes
  ];
```

Qual o ganho disso? Bom agora os *entry components* podem ficar nos seus respectivos módulos! Não sendo mais necessário deixa-los nos módulos que inicialmente não eram responsáveis por eles (algo que era inicialmente ruim na nossa arquitetura)!
Um dos problemas dos módulos *lazy loaded* era que, não conseguiamos criar componentes dinamicamente sem o módulo estar carregado pelo Angular.

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

## Proxy

Adicione os end-points da sua api no arquivo `proxy.conf.json` para evitar problemas com CORS (desenvolvimento apenas).

* [Fazendo o CORS seu amigo](https://www.hiago.me/2018/09/08/ionic-angular-fazendo-o-cors-seu-amigo/) - By Hiago.
* [Proxying to a backend server](https://angular.io/guide/build#proxying-to-a-backend-server) - Angular.io.

```sh 
{
  "/api": {
    "target": "http://localhost:4200",
    "secure": false
  }
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

## Temas

Utilizando o scss, foi gerado 2 temas `light` e `dark` no arquivo `/src/themes/framework/_themes.scss`, a saída deste arquivo pode ser vista aqui:

* [Gist Github](https://gist.github.com/TusaMAL/3d862bc5f0d9dbd967b97ae7dfc34ff1) - Input/Output themes.scss

Se baseando neles crie temas para o seu arquivo, os temas são adicionados utilizando o `@HostBinding` no `core.component.ts` ficando assim: 

```sh
    theme: Theme = Theme.light;

    @HostBinding('class.theme-dark') get darkTheme() {
        if (this.theme === Theme.dark) { return true; }
    }

    @HostBinding('class.theme-light') get lightTheme() {
        if (this.theme === Theme.light) { return true; }
    }
```

Para mudar de tema apenas altere o valor da propriedade `theme` que o angular vai se encarregar de adicionar o tema nas classes do `app-core-root` como no exemplo será `theme-light` ou `theme-dark` por padrão está o light. 

```sh
<app-core-root class="theme-light">
  ...
</app-core-root>
```

A classe `Theme` é um enum sua model está na pasta `models`.

## Estrutura de Arquivos

As pastas estão organizadas desta maneira, cada módulo tem suas pastas `component`, `directives`, `models`, `pages`, `pipes` e `services`, dentro das pastas existe um arquivo `index.ts` para exportar os arquivos da pasta para deixar mais simples muitos imports.

Em especial o `feature` module que é um modulo referência para criar outros.

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