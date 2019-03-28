# API-RESTful

Repositório com o projeto desenvolvido para o desafio "Backend Developer 1" da empresa Field Control. O recurso escolhido para o projeto foram filmes. 

A API foi desenvolvida com **Node.js** e **MongoDb** e os frameworks e bibliotecas descritas a seguir.

## Framework e bibliotecas utilizadas

 - **Express** como framework para facilitar o desenvolvimento;
 - **Mongoose** para simplificar a manipulação e validação dos dados do banco MongoDb;
 - **Body-parser** para fazer o parse dos dados do corpo das requisições;
 - **Dotenv** para pemitir o uso de dados de ambiente pela leitura de um arquivo;
 - Dev:
   - **Mocha** como framework para realizar teste para a API;
   - **Supertest** para fornecer uma abstração maior na realização dos teste.

## Instalação do projeto

Instalar depêndencias:

    npm install
    
Criar arquivo `.env` na raiz da API, com as variáveis como o exemplo abaixo:

    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/valinor-filmes
    MONGODB_URI_TEST=mongodb://localhost:27017/valinor-filmes_test
    NODE_ENV=production
    
Carregar dados iniciais ao projeto (opcional):

    mongorestore --db valinor-filmes .\dump\
    
Iniciar API:

    npm start

## Rotas

| Método | URL  | Comportamento                               | 
|--------| ---  |                                                  --- |
| GET    | /filmes     | Recupera a lista de filmes, essa ação é paginada e possibilita busca pelas propriedades do filme | 
| GET    | /filmes/:id | Recupera um filme em específico pelo id  | 
| POST   | /filmes     | Insere um novo filme                     | 
| PUT    | /filmes/:id | Altera um filme existente                | 
| PATCH  | /filmes/:id | Altera parcialmente um filme existente   | 
| DELETE | /filmes/:id | Exclui um filme existente                |