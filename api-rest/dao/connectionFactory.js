var mysql = require('mysql');

function createDBConnection(){

    // Caso não explicitar o NODE_ENV
    if(!process.env.NODE_ENV){
        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1234',
            database: 'resourceDb'
        });
    }

    // Banco de Dados de Teste Isolado do de Desenvolvimento
    if(process.env.NODE_ENV == 'test'){

        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1234',
            database: 'resource_db_teste'
        });
    }

}

module.exports = function() {
    return createDBConnection;
}