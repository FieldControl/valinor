## Envio de solução

Gostaríamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

- Ferramentas 
    - VSCode
    - Postman
    - Heidsql
- Bibliotecas
    mysql
    express
- Técnologias
    - nodeJS
    - mysql

**Tecnologias**

Express foi usado para facilitar o mapeamento das rotas da aplicação
Foi dada preferência para o msyql em relação ao postgress e ao mongodb por uma questão de familiaridade.

**Desafios e problemas**

O principal desafio foi u uso do js, tive contato contato com a linguagem mas me considero pouco experiente no seu uso.
inicialmente o código não estava muito legível, então decidi refatorar e fazer o uso promisses isso ajudou a organizar as coisas e deixar o código mais claro.

**Melhorias e próximas implementações**

 - Adição de documentação para os recursos criados, talvez algo utilizando o swagger
 - Melhoria da classe AutomovelRepo atualmente ela contém bastante manipulação de string junto ao         código sql oque pode permitir que o banco de dados sofra de sql injection

**Contato**
 
  - celular: (17) 98193-8155,
  - email: leonardo.falco@outlook.com
----------

Rest Api contendo informações sobre automoveis
===========================================

este projeto contempla uma api rest que implementa os recursos propostos no desafio de backend.

----------

Ambiente necessário
----------
- [node v10.15.1](https://nodejs.org/en/)
- [mysql 8.0.15](https://dev.mysql.com/downloads/mysql/)


Executando este projeto
------------------------
Com o node e mysql instalados e as suas variaveis de ambiente configuradas
acesse a raiz do projeto e execute os seguintes comandos

    # clone do projeto
    git clone https://github.com/LeoFalco/valinor
    
    # acessando diretorio do projeto
    cd valinor
    
    # executando o script sql que cria o usuario a estrutura
    # e insere alguns dados de demonstracao
    mysql -u root -p your_root_pass < ./db/create_database.sql
    
    # resolvendo as dependencias no projeto
    npm install
    
    # iniciando aplicacao
    node ./


Documentação da Api
--------

    #execute o projeto e acesse
    http://localhost:300/api-docs
