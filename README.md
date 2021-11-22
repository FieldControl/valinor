# GNIMES

<!--ts-->

### Sumário

- [Propósito da aplicação](#proposito)
- [API Utilizada](#api)
- [Inspirações](#inspiracao)
- [Telas](#telas)
- [Tecnologias](#tecnologias)
    - [Typescript](#typescript) 
    - [NextJS](#nextjs) 
    - [SaSS](#sass) 
    - [Jest](#jest)
 - [Princípios da Engenharia de Software](#principios)
 - [Desafios encontrados e como foi solucionados](#desafios)
 - [Melhorias a serem feitas e seu impacto](#melhorias)
 - [Sobre](#about)
 - [Contato](#contato)

<!--te-->

<h1 id="proposito"> Propósito da aplicação</h1>

Essa aplicação tem como objetivo tratar arquivos json recebidos de uma REST API e renderizar no lado do cliente utilizando o NextJS Framework.

<h1 id="api">API</h1>

Para o projeto foi utilizada [https://aniapi.com/](ANIAPI) onde é servido todos os animes.

TOKEN API:

`
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NCIsIm5iZiI6MTYzNjUxMDU1NSwiZXhwIjoxNjM5MTAyNTU1LCJpYXQiOjE2MzY1MTA1NTV9.hvjM1cmWiicUiQUrevsRdXgKyUBU_a0V_83LPBHSxwE `


### Endpoints:

GET

---

v1/animes

v1/animes/:id

<h1 id="initial">COMO INICIAR O PROJETO?</h1>

Para rodar o projeto é necessários as seguintes etapas.


Instale as dependências do projeto com `npm run install`.

Caso nao eista uma .env.local crie o arquivo e adicione o token da api acima.

Rode `npm run dev`.

acese http://localhost:3000

<h1 id="inspiracao">Inspirações</h1>

Para a tela final busquei inspirações em sites de prototótipos gratuitos como o [https://dribbble.com/](DRIBBBLE)!

![Dribbble](https://cdn.dribbble.com/users/5902550/screenshots/15781513/media/ed64345f93aeab5df8f31043a2978b95.png)
Legenda: Essa foi a referência utilizada.

<h1 id="telas">Telas</h1>

### Página inicial - HOME

![Imagem home](img/HOME.png)

### Página de listagem de todos os animes - ANIMES

![Imagem animes](img/ANIMES.png)

### Informações individuais de cada anime - INTERNA

![Imagem interna](img/INTERNA.png)

<h1 id="tecnologias">🛠 Tecnologias</h1>

- [TypeScript](https://www.typescriptlang.org/docs/)
- [NextJS Framework](https://nextjs.org/)
- [SaSS](https://sass-lang.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Axios](https://axios-http.com/docs/intro)

<h2 id="typescript"> Typescript no projeto</h2>

Sempre escolho utilizar Typescript nos meus projetos para deixar a manutenção e organização de tipos bem fáceis e declarativas, e se estiver em uma equipe, a outra pessoa não fica perdida no código.

<h2 id="nextjs">NextJs</h2>

NextJS é um framework para o ReactJS que veio com o intuito de transformar uma SPA em React em SEO AMIGÁVEL. Como desenvolvo algumas páginas comerciais, é muito importante ter esse recurso, porém, NextJs tem muito mais recursos que acabo escolhendo ele ao invés de uma simples aplicação React.

O roteamento das páginas é o caminho dos arquivos residente na pasta `/page` dentro de 'src', isso agiliza muito o processo de roteamento, onde minha preocupação é só a aplicação.

NextJS também trouxe umas das funcionalidades que como dito no começo é a principal força desse framework, a geração de arquivos estáticos. Com a geração de arquivos estaticos SSG ( Static site generator), além de ajudar na parte do SEO, a aplicação fica muito mais rapida ao ser renderizada no lado do cliente.

Outra funcionalidade que no projeto em si nao acabei utilizando mas que é muito útil é a geração de arquivos pelo lado do servidor. O NextJS trabalha nos dos lados, tanto no lado do cliente quanto no lado do servidor, possibilitanto muitos recursos antes de entregar a tela final para o usuário

<h2 id="sass">SASS</h2>

Utilizo SaSS em muito dos meus projetos também por facilitar muito na semântica de códigos css.

<h2 id="jest">Jest</h2>

O Jest foi utilizado para realização dos teste, onde traz muito recursos que facilitam na hora de testar aplicações React

<h1 id="principios">PRINCÍPIOS DA ENGENHARIA DE SOFTWARES UTILIZADOS</h1>

### KISS (Keep It Simple, Stupid!)
Procurei ser o mais simples e aplicar tudo que foi pedido para esse desafio.

### (S) OLID - Single Responsibility Principle (SRP)
Mesmo sabendo que não se trata de uma aplicação com classes e abstrações tentei utilizar um pouco da ideia do "Princípio da Responsabilidade Única", onde cada componente tem sua responsabilidade, e separando isso tornei menos complexo e mais fácil de manter a manutenção.


<h1 id="desafios">ALGUNS PROBLEMAS ENCONTRADOS E COMO FOI RESOLVIDO</h1>

No projeto, como faço varias requisições em um curto periodo de tempo a API tem um certo limite.

Minha solução: controlar as requisições com um gerenciamento de estando que aguarda a requisão ser completada impossibilitando uma nova requisição pelo usuário.

<h1 id="melhorias">FEATURES</h1>

- [ ] Uma versão mobile - Atualmente o aplicativo só funciona na versão desktop e isso é bem fácil de implementar e melhoria muito o acesso a aplicação.

- [ ] Criar filas para as requisições - Criando filas para as requisões acho que controlaria melhor o tempo delas e evitaria tantas chamadas a api desnecessárias.

<h1 id="melhor">O QUE PODERIA TER FEITO MELHOR?</h1>

- Ainda estou estudando como implementar o desenvolvimento guiado pro teste. É algo que pra mim está sendo um processo mais lento por estar habituado a só criar o código de uma vez ao invés de seguir procedimentos guiados a teste. O que poderia ser melhorado seria a parte de testes para manter a aplicação com uma facilidade maior para manutenção.

<h1 id="about">SOBRE O DESENVOLVEDOR</h1>

Meu nome é Guilherme Vinicius, tenho 22 anos e estou cursando o último semestre em Análise de Desenvolvimento de sistema pela FATEC Rio Preto. Há algum tempo venho me dedicado totalmente ao desenvolvimento frontend onde sou totalmente apaixonado.

Comecei trabalhando como estágiario dev fullstack na Empro, onde fiquei quase 2 anos trabalhando com Angular, Javascript e PHP e utilizava o PLSQL - Oracle como banco de dados para desenvolvimento de sistemas para prefeitura.

Após acabar meu contrato, entrei na w3mídia, onde trabalho atualmente. Trabalho utilizando Laravel framework para o desenvolvimento de sites comercias e atuando como fullstack.

Nesse meio tempo senti a necessidade de procurar novos níveis, tentando evoluir profissionalmente. Adquiri o curso da Rockseat - Ignite onde a trilha que segui era o desenvolvimento com ReactJS, e de lá pra cá, venho aprimorando cada vez mais tudo que absolvi do curso.

<h1 id="contato">Contato</h1>

Whatsapp/Telefone: (17) 991384689

email: guilhermeviiniii@gmail.com 