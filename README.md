Simple CRUD Application with AdonisJS
===========================================


To run this app, you will need
----------
- Node
- MySQL
- AdonisJS 

Also, you have to create a .env file:
------------
HOST=127.0.0.1
PORT=3333
NODE_ENV=development
APP_NAME=AdonisJs
APP_URL=http://${HOST}:${PORT}
CACHE_VIEWS=false
APP_KEY=fmnT43BNkq4ep7nDfDVQrsI9yOTLvKVq
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER={youruser}
DB_PASSWORD={yourpassword}
DB_DATABASE={yourDB}
HASH_DRIVER=bcrypt


Método 	URL 			Comportamento esperado
GET 	api/v1/cars 		Recupera a lista dos carros, essa ação deve ser paginada e deve possibilitar busca pelas propriedades do recurso
GET 	api/v1/cars/:id 	Recupera um carro em especifico pelo id
POST 	api/v1/cars/ 		Insere um novo carro na base
PUT 	api/v1/cars/:id 	Altera um carro existente
PATCH 	api/v1/cars/:id 	Altera parcialmente um carro existente
DELETE 	api/v1/cars/:id 	Exclui um carro existente

POST with some data:
-------
{
	"make": "GM",
	"model": "Vectra",
	"year": "2011",
	"style": "Hatch",
	"color": "White"
}


Sobre a avalição
--------

- Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou
Node e AdonisJS

- Porque você optou pela tecnologia X e não a Y
Optei por Node por gostar mais de trabalhar com javascript. A escolha do Adonis fiz por não conhecer a ferramenta e querer aprender, então já aproveitei o desafio para aprender um pouco sobre ela :D

- Desafios e problemas que você enfrentou e como você resolveu
O desafio que enfrentei foi aprender, como configurar e criar as rotas do CRUD de exemplo. Foi bem legal utilizar o Adonis, super fácil de configurar/usar.

- O que você entende que pode ser melhorado e como fazer isso
No exemplo que fiz, poderia implementar as funcionalidades de login para fazer alguma alteração nos itens, por exemplo. 
