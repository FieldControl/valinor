# Google Books Search SPA

Este é um Single Page Application (SPA) construído usando o framework Angular 13 que permite a pesquisa de livros na API do Google Books.

## Funcionalidades

O aplicativo permite ao usuário:

- Pesquisar livros por palavras-chave
- Paginação dos resultados da pesquisa
- Visualizar informações relevantes de cada livro, como título, autor e imagem da capa do livro.
- Acesso ao link da página do livro no Google Books para mais informações

## Requisitos

- Node.js (versão 14.x ou superior)
- Angular CLI (versão 13.x ou superior)

## Como usar

Para executar o projeto, siga os seguintes passos:

1. Clone o repositório em sua máquina local;
2. Instale as dependências do projeto com o comando `npm install`;
3. Execute o comando `ng serve --open` para iniciar o servidor de desenvolvimento;
4. Acesse a aplicação em seu navegador, no endereço `http://localhost:4200`.


## API

Este aplicativo consome a API do Google Books, que é acessível através do seguinte endpoint:

https://www.googleapis.com/books/v1/volumes?q={searchTerm}&startIndex={startIndex}&maxResults={maxResults}

- `searchTerm`: Palavra-chave a ser pesquisada
- `startIndex`: Índice do primeiro resultado a ser retornado (para paginação)
- `maxResults`: Número máximo de resultados a serem retornados (para paginação)

## Considerações finais

Este aplicativo foi desenvolvido com o objetivo de demonstrar o conhecimento em Angular e boas práticas de desenvolvimento de software.

O código está organizado em uma estrutura MVC, com os componentes separados em pastas distintas. 

Caso tenha alguma dúvida ou sugestão, sinta-se à vontade para entrar em contato comigo. Obrigado por usar o Google Books Search SPA!