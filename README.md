Rest Api contendo informações sobre automoveis
==============================================

este projeto contempla uma api rest que implementa os recursos propostos no desafio de backend.

----------

Ambiente necessário
-------------------
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
Execute o projeto e acesse http://localhost:3000/api-docs
