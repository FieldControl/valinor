# Borderlands API

## Index

1. [Ideia Geral](#ideia-geral)
2. [Informações Importantes](#informações-importantes)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Banco de Dados](#banco-de-dados)
5. [Rotas](#rotas)
6. [Respostas: "Envio de Solução"](#respostas:-"envio-de-solução")
7. [Créditos](#créditos)


***









## Ideia Geral

Criar uma API com operações de um CRUD, utilizando os métodos: *GET*, *POST*, *PUT*, *PATCH* e *DELETE*.  
A API acessa um banco de dados com informações das armas do jogo Borderlands (apenas um template com uma informação de teste) porque Borderlands 3 ta logo ai.

***










## Informações Importantes

O servidor API utiliza tecnologia providenciada pelo Node.JS (javascript) com a utilização do Framework Express.JS e integração com um Banco de Dados MySQL

A API esta programada para escutar a porta *3000*

***








## Estrutura de Arquivos

* ***Borderlands_API - Project Folder***
  * **connections**  
    * sql_connect.js (código de inicialização de conexão com o servidor MySQL)  
  * **DB**
    * borderland_db_init.sql (SQL de inicialização de banco)
    * gun_types_table.json (Backup das informações: Tabela *'gun_type'*)
    * manufacturers_table.json (Backup das informações: Tabela *'manufacturers'*) 
  * **routes**
    * gun_types.js (rotas GET para Tabela *'gun_type'*)
    * guns.js (rotas GET para View *'gun_view'* e POST/PUT/PATCH/DELETE para Tabela: *'guns'*)
    * manufacturers.js (rotas GET para Tabela *'gun_type'*)
  * app.js (arquivo "MAIN")  
  * package.json (arquivo de dependencia e informações do node.js)  
  * query_result.js (função principal executada pelas rotas)  
  * README.md (este exato arquivo)

***








## Banco de Dados

Banco de Dados MySQL.  
Nome Database: *borderland_db*

SQL para geração do banco: *borderland_db_init.sql*  
**OBS:** Arquivo gerado pelo *Data_Export* do MySQL Workbench.

***
### Tabela: **guns**
  
| Nome Coluna | Descrição  |
|-------------| ---  |
| *id_guns* | Identificador Unico da Arma 
| *gun_name*| Nome da Arma
| *gun_desc*| Descrição da Arma
| *id_manufacturer*| Identificação da Marca da Arma (ligada a tabela *manufacturers*)
| *id_gun_type* | Identificação do Tipo da Arma (ligada a tabela *gun_type*)
***
### Tabela: **gun_type**
  
| Nome Coluna | Descrição  |
|-------------| ---  |
| *id_gun_types* | Identificador Unico do Tipo de Arma 
| *type_name*| Nome da Categoria da Arma


***TABELA READ-ONLY***  
*Informações padrão já gravadas na tabela (encontradas no arquivo **gun_types_table.json**)*

***
### Tabela: **manufacturers**
  
| Nome Coluna | Descrição  |
|-------------| ---  |
| *id_manufacturer* | Identificador Unico da Empresa Produtora de Armas
| *manufacturer_name*| Nome da Empresa


***TABELA READ-ONLY***  
*Informações padrão já gravadas na tabela (encontradas no arquivo **manufacturers_table.json**)*

***

### View: **gun_view**

View criada para simplificar a visualização da tabela *guns*.  
Substituindo os campos **ID** (chaves estrangeiras) com o valor **_name* relacionado a elas. 
    
| Nome Coluna | Descrição  | Referência [Tabela.Coluna]
|-------------| ---  | --- |
| *Gun ID* | Identificador Unico da Arma |*guns.id_guns*
| *Gun Name*| Nome da Arma |*guns.gun_name*
| *Gun Type*| Nome da Categoria da Arma |*gun_type.type_name*
| *Gun Description*| Descrição da Arma |*guns.gun_desc*
| *Manufacturer*| Nome da Empresa |*manufacturers.manufacturer_name*
  



***

## Rotas

Todas as tabelas podem ser acessadas através das rotas providenciadas pel aAPI (menos a tabela *guns* onde sua visualização é simplificada para o usuário pela *gun_view*)

Tabelas **READ-ONLY** somente são acessadas pelo método **GET**  
Os métodos **POST**, **PUT** e **PATCH** utilizam informações vinda do header HTTP

### Parâmetros Header para as Operações POST, PUT e PATCH de **/guns**

* ***name*** = String para alocação em *gun_name*
* ***desc*** = String para alocação em *gun_desc*
* ***id_man*** = INT para alocação em *id_manufacturer*
  * Deve ser um número que exista na tabela *manufacurer*
  * Range Padrão: 1 a 12
* ***id_type*** = INT para alocação em *id_gun_type*
  * Deve ser um número que exista na tabela *gun_type*
  * Range Padrão: 1 a 8

**OBS:** O parâmetro *id_gun* nunca é alterado para evitar que o usuário gere algum conflito de **ID**. O mesmo esta configurado como **AUTO_INCREMENT**, ou seja, a cada novo **INSERT** o *id_gun* será igual o ultimo *id_gun+1*

### Tabela de Rotas

| Método | Rota | Descrição da Função |
| ---    | ---  | ---                 |
| **GET**| /*guns* | Visualiza toda a View *gun_view*
| **GET**| /*guns/:id* | Visualiza o item da View *gun_view* onde seu *GUN ID* é igual ao *:id* fornecido
| **GET**| /*types* | Visualiza toda a Tabela *gun_type*
| **GET**| /*types/:id* | Visualiza o item da Tabela *gun_type* onde seu *id_gun_type* é igual ao *:id* fornecido
| **GET**| /*manufacturers* | Visualiza toda a Tabela *manufacturers*
| **GET**| /*manufacturers/:id* | Visualiza o item da Tabela *manufacturers* onde seu *id_manufacturer* é igual ao *:id* fornecido
| **POST**| /*guns* | Adiciona uma nova tupla na Tabela *guns* com os Parâmetros informados pelo Header HTTP
| **PUT**| /*guns/:id* | Modifica todos os atributos de um item na Tabela *guns* com os Parâmetros informados pelo Header HTTP. Sendo que o id deste item (*id_guns*) é fornecido pelo *:id*
| **PATCH**| /*guns/:id* | Modifica apenas os atributos informados pelo Header HTTP de um item na Tabela *guns*. Sendo que o id deste item (*id_guns*) é fornecido pelo *:id*
| **DELETE**| /*guns/:id* | Deleta um item na Tabela *guns*. Sendo que o id deste item (*id_guns*) é fornecido pelo *:id*



***








## Respostas: "Envio de Solução"

**Framework, linguagem e ferramentas**

Foi utilizado a ferramenta Node.JS em conjunto com o Framework Express.JS e a ferramenta de Banco de Dados MySQL. Tudo foi editado pelo Visual Studio Code

**Técnologias X e Y**

O desenvolvimento de uma API REST é algo novo para mim.  
Toda tecnologia nova gosto de pesquisar como desenvolvedores mais experientes seguem para a soluciona-las (até porque eles tem mais experiência nela).  
Pesquisando sobre desenvolvimento de APIs, Node.JS é altamente citado por suas inúmeras funcionalidades, assim como seu framework Express.JS que é um middleware altamente utilizado para facilitar a criação de APIs RESTful no ambiente Node.JS.  
Para Banco de Dados utilizei o MySQL por se tratar de uma aplicação que já tenho um pouco mais de experiência sobre, principalmente na liguagem SQL.  
E por fim utilizei o Visual Studio Code por sua alta praticidade em edição de código (sem contar que eu baixei ele uma duas semanas atrás e *dropei* totalmente o Sublime por cause dele)

**Desafios e problemas**

* Meu primeiro desafio foi utilizar o MySQL Workbench. Sempre trabalhei com o MySQL sem utilizar o workbench geralmente utilizava ferramentas como phpMyAdmin, mas decidi tentar aprender um pouco do MySQL Workbench durante o projeto e senti bastante dificuldade em navegar nas milhões de funcionalidades que ele propõe.
  * A solução foi simples. Algumas horas na internet pesquisando as funções essenciais para o projeto, algumas tentativas e erros e fuçar bastante na ferramenta
* Meu segundo desafio foi retirar as informações adicionais enviadas pelos métodos POST, PUT e PATCH na aplicação.
  * Após algumas tentativas com a função body-parser e muitos debugs em conjunto com o PostMan, tentando evitar mais perda de tempo neste quesito utilizei o Header HTTP para retirar as informações com mais facilidade.

**Melhorias e próximas implementações**

- [ ] **Refatoração das funções aplicadas nos arquivos de rotas:** A rota poderia chamar uma função modular exportada em uma pasta com uma coleção de funções (pasta controllers).
- [ ] **Adicionar Leitor de Parâmetros Adicionais pelo Body nos métodos POST, PUT e PATCH:** Identificar se existe informações sendo enviadsa pelo Header ou Body HTTP nos métodos citados e utiliza-las se sua existencia for verdadeira (no caso se for passado as informações corretas em ambos Header e Body o aplicativo escolhe um deles como padrão)
- [ ] **Adicionar mais colunas na tabela *guns*:** Ainda existe muitas outras informações a serem adicionadas sobre as armas do jogo. Principalmente seus *status* como tipo elemental, tamanho do clipe, dano e etc.
- [ ] **Popular tabela *guns*:** A graça do jogo são as armas. Então uma tabela cheia delas seria muito divertido.

***







## Créditos
Programação e Documentação por: Carlos Gabriel Luz Monnazzi (Dreamblader)  

LinkedIn: [Carlos Gabriel Luz Monnazzi](https://www.linkedin.com/in/carlos-gabriel-luz-monnazzi-340201156/)  
GitHub: [Dreamblader](https://github.com/dreamblader)  
E-Mail: carlosgabrielmaster@gmail.com