Este é um projeto Next.js inicializado com create-next-app

## Getting Started

Primeiro, instale as dependencias necessárias:

```bash
npm install
# ou
yarn install
```

Depois execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

## Importante, Antes de executar a aplicação crei um arquivo .env 
No arquivo adicione a segunite linha

```bash
API_GITHUB=https://api.github.com/search/repositories?q=
API_USER_GITHUB=https://api.github.com/search/
```

Abra [http://localhost:3000](http://localhost:3000) com seu navegador para ver o resultado.


## Ferramentas utilizadas para desenvolver esta SPA foram

- [Nextjs](https://nextjs.org/)
- [NextUi](https://nextui.org/)
- [tailwindcss](https://tailwindcss.com/)
- [ESLint](https://eslint.org/)
- [Axios](https://axios-http.com/)

## Escolha de Tecnologias

Utilizei o React por ser um dos frameworks mais atualizados da web e por possuir ampla familiaridade e conhecimento. Optei pelo Next.js para o desenvolvimento, dado que esta biblioteca está entre as melhores soluções otimizadas disponíveis no mercado. Caso necessite de um servidor em minha aplicação, o Next.js atende às minhas necessidades. Além disso, a capacidade de otimização de imagens oferecida pelo Next.js foi um fator importante em minha decisão, bem como o fato de ser o framework recomendado para desenvolvimento com React, conforme mencionado em sua documentação.

Para a estilização das interfaces, escolhi o Tailwind CSS, pois, em minha opinião, ele facilita significativamente o processo de desenvolvimento. Além de ser fácil de utilizar, conta com uma boa documentação. Vale ressaltar que o uso do Tailwind CSS evita a necessidade de criar um arquivo de estilo para cada página ou componente, o que me permite evitar o uso do componente de estilo do React, que segue uma abordagem orientada a objetos.

Para realizar requisições HTTP, optei por utilizar o Axios em vez do fetch do JavaScript, visando uma melhor organização e simplificação do código.

No que se refere à estilização de componentes, escolhi o Next UI simplesmente porque aprecio o estilo que ele oferece.

Por fim, utilizei o ESLint para a formatação do projeto, o qual padroniza desde a identificação do código até o uso correto de aspas e ponto e vírgula no final de cada linha.

Em resumo, optei pelo React e Next.js devido à minha experiência com esses frameworks, o que me proporcionou facilidade, manifesto meu interesse em desenvolver com Angular, no entanto, devido à ausência de experiência nesse framework específico, optei por utilizar outra alternativa.

## Sobre o projeto
- Pesquisa de repositórios do GitHub e de usuários.
- Exibição de resultados de pesquisa em uma lista paginada.
- Detalhes do repositório, descrição, imagem e link do repositório.

## Link do projeto
https://search-repository-github.vercel.app/
