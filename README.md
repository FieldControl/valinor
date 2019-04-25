{ "challenge": "Backend Developer 1" }
----------

Desenvolver uma API JSON RESTful expondo operações de um CRUD.

Pense em algum recurso (use sua criatividade), pode ser gatos, personagens dos senhores do anéis, personagens da marvel, pokemon, enfim, o que você quiser..

Utilize todos os métodos (GET, POST, PUT, PATCH, DELETE)

Você terá que expor os seguintes endpoints para o recurso escolhido:

| Método | URL  | Comportamento esperado                               | 
|--------| ---  |                                                  --- |
| GET    | /resources     | Recupera a lista dos recursos, essa ação deve ser paginada e deve possibilitar busca pelas propriedades do recurso | 
| GET    | /resources/:id | Recupera um recursos em especifico pelo id | 
| POST   | /resources     | Insere um novo recurso                     | 
| PUT    | /resources/:id | Altera um recurso existente                | 
| PATCH  | /resources/:id | Altera parcialmente um recurso existente   | 
| DELETE | /resources/:id | Exclui um recurso existente                |

- **Qual Web Framework?** pode ser Express.js, Hapi, Restify, Koa, fastify, o que você preferir :P
- **Qual Banco de dados?** Mesmo pensamento, pode ser MongoDb, DynamoDb, Postgres, MySql.. enfim, não importa :)
