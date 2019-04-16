//CONNECT TO THE MYSQL DB
const mysql = require('mysql')

//connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'borderland_db',
});

//export
module.exports = connection