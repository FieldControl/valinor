========================================================
READ ME >>> GRAPHQL API CRUD
========================================================

Antes de qualquer coisa, crie um banco de dados em mysql 
e execute as migrations utilizando o banco 
criado por você.

O metodo de utilização dos comandos das migrations sera visto 
abaixo:

-------------------------------------------------------------

Para uso da api, é necessario que se entenda sobre como 
utilizar as migrations 

Para fins praticos, deixarei os comandos de terminal 
nas linhas abaixo:

npm i - instala as dependencias do package.json

npx knex migrations:latest -- cria as tabelas das migrations
npx knex migrations:rollback -- exclui as tabelas e os dados contidos nelas

npm start -- inicia o servidor



Metodo de cadastro de super-usuario 

Vá para a pasta db, lá você verá um arquivo 
chamado knex.sql, clique nele.

Execute o comando npm start no terminal

logo após, na tela de playground copie, cole e execute a seguinte mutation

registrarUsuario (dados:{
    nome: "Teste"
    email: "teste@hotmail.com.br"
    senha: "teste123"
})

logo após, vá até o arquivo knex.sql, 
que está localizado na pasta >db

e execute a linha 18

logo após verificar o id do usuario que quer transformar em master

execute a linha 20 

trocando o comando 

usuario_id = id do usuario que quer transformar em master.


>> antes de fazer qualquer procedimento, instale a 
extensão do vsCode SQL:Connect to mysql, para poder
se conectar com o banco mysql de maneira simplificada >>



