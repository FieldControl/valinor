
## Configurações do Banco de Dados

* Configure um Banco de Dados MySql, criando uma tabela com nome 'resources' na base de dados 'resourceDb'
    
    ```sql
    create database resourceDb;
    use resourceDb;

    CREATE TABLE `resources` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `nome` varchar(255) NOT NULL,
            `email` varchar(255) NOT NULL,
            `status` varchar(255) NOT NULL,
            `data` DATE,
            PRIMARY KEY (id)
    ); 
    ```

* Acesse a partir da raíz do repositório "database/" e copie todo o conteúdo do arquivo "insert.sql" e execute esses scripts na tabela recém criada.

* Acesse o arquivo "(raiz)/api-rest/dao/connectionFactory.js" e modifique as configurações de Banco para as configurações do seu Banco de dados local de dev e teste.

    ```js
    
    function createDBConnection(){
        return mysql.createConnection({
            host: 'SEU_HOST',
            user: 'USER(root, talvez)',
            password: 'SENHA',
            database: 'NOME_DATABASE'
        });
    }

    ```
    
## Iniciando e testando a Aplicação

* Instalar todas as dependências do Projeto.
    
    ```
    npm install 
    ```
* Para rodar a aplicação

    ```
    npm start
    ```

* Para rodar os testes

    ```
    npm test
    ```

* Em "package.json" conferir os scripts de acesso rápido:

    ```json
    "scripts": {
        "start": "nodemon cluster.js",
        "test": "node node_modules/mocha/bin/mocha"
    }
    ```