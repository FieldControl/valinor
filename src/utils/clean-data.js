const mysql = require('promise-mysql')
const spawn = require('cross-spawn');
const { databaseCredentials: credentials } = require('./config')
const { truncateTables, tableNames } = require('./datasource')


async function cleanData() {
    try {
        const con = await mysql.createConnection({ ...credentials });

        let tables = await tableNames(con, credentials.database)
        tables = tables.filter(tableName => tableName != "_Migration")

        await truncateTables(con, tables)

        console.log("ok")
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

cleanData()