# Envio de solução - PokeHub 

Você pode visualizar a aplicação clicando [Aqui](https://pokehub-amber.vercel.app/), mas caso prefira, pode rodar localmente seguindo os passos abaixo:

## Requisitos
- [NodeJS](https://nodejs.org/en/download/)
- Um gerenciador de pacotes de sua preferência: [NPM](https://nodejs.org/en/download/) ou [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable)

## Preparando o ambiente

Antes de tudo, você vai precisar clonar a branch que contém o projeto utilizando o comando:

```
$ git clone -b marcelo-santos https://github.com/marceloWired/valinor.git
```

Feito isso, você deverá navegar até a pasta onde o projeto se encontra:

```
$ cd valinor
$ cd pokehub
```

Ou simplemenste

```
$ cd valinor/pokehub
```

Uma vez dentro da raiz do projeto, será necessário instalar todas as dependências:

Para NPM:
```
$ npm install
```

Para Yarn:
```
$ yarn
```

Agora por fim, é só iniciar o projeto com o comando:

Para NPM:
```
$ npm run start
```

Para Yarn:
```
$ yarn start
```


**Framework, linguagem e ferramentas**

Este projeto foi criado utilizando a biblioteca ReactJS juntamente com a linguagem/superset TypeScript e para a estilização, apenas CSS e Styled Components.

Para algumas funções específicas, foram utilizados outras libs como:

- React Paginate para paginação;
- Axios para conexão com a API;

A única ferramenta de edição de texto foi o Visual Studio Code.

**Técnologias X e Y**

Após o levantamento de requisitos do site, notei que não se tratava de nada muito complexo, onde qualquer tecnologia apropriada para o desenvolvimento de SPA's(como Angular, Vue etc) cairia muito bem.

Pensando nisso, o React foi escolhido devido a prévia familiarização que eu tinha com a biblioteca, o que possibilitou um desenvolvimento mais ágil.


**Princípios de software**

Utilizei o princípio de Clean Code, sempre mantendo as variáveis e funções com nomes auto explicativos, de maneira que o código ficasse o máximo legível possível. Além de seguir as principais convenções/estrutura de pastas com desenvolvimento React (nomenclatura de Hooks, separação de componentes e etc).

**Desafios e problemas**

Manter a aplicação responsiva sempre é um baita desafio, e desta vez não foi diferente. Passei boas frações do tempo total de desenvolvimento apenas deixando tudo responsivo, resolvendo os problemas pesquisando em sites como o w3schools, css-tricks e outros.

Em primeiro momento também tive certa dificuldade com a paginação, mas assim que encontrei o React-Paginate tudo ficou muito mais simples.

**Melhorias e próximas implementações**

Tenhos alguns pontos que deixei anotado para melhorias futuras que pretendo implementar, como:

- **Sugestão de nome do pokemon na hora da busca:** como a pokeAPI não retorna nomes similares à busca, imagino que eu precise ter em minha base o nome de todos os pokemons cadastrados, e fazer este serviço por minha conta;
- **Melhoria no layout mobile:** Tenho em mente que a versão mobile pode ser melhorada em alguns pontos, o que será revisado no futuro;
- **Informações mais detalhadas do pokemon:** ao clicar na carta do pokemon, abrir uma aba maior com mais informações sobre o pokemon, listando o tipo do pokemonm, ataques, evoluções e etc.


**Sobre você**

Meu nome é Marcelo dos Santos, tenho 20 anos e atualmente moro na zona leste da cidade de São Paulo/SP.

Desde os meus 6 anos sou apaixonado por computadores, desde aquela época sempre jogando (um grande destaque para os jogos, que fizeram essa paixão nascer), e navegando pela internet.

Até meados dos meus 15 anos, o computador ainda era somente um equipamento para diversão, e foi nas aulas de informática  do curso técnico de Contabilidade que fiz pela ETEC Zona Leste, que meu professor me mostrou todas as possibilidades da área, o que fez despertar meu interesse.

Desde então, venho estudando coisas relacionadas a computadores, e em 2019 quando entrei na faculdade, comecei a focar em programação.

No primeiro semestre de faculdade consegui um estágio como suporte técnico na Guess Brasil, onde permaneço até hoje. Fiquei dois anos neste cargo e em abril deste ano fui efetivado para assistente de TI, onde atuo na área de desenvolvimento utilizando NodeJS e React majoritariamente.


**Contato**

**Email**: marcelo.santosdev1@gmail.com
**Whatsapp**: (11) 95238-5511



