const mysql = require("mysql");
const env = require("../environment");

module.exports = function () {
    return mysql.createConnection(env.mysql);
};