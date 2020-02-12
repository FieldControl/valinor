const mysql = require('promise-mysql')
const spawn = require('cross-spawn');
const { databaseCredentials: credentials } = require('./config')
const { createTableMigration, dropTables, tableNames } = require('./datasource')

async function dropCreate() {
    console.log(credentials)
    try {
        const con = await mysql.createConnection({ ...credentials })
        const tables = await tableNames(con, credentials.database)

        await dropTables(con, tables)
        await createTableMigration(con)

        // Spawn NPM synchronously
        spawn.sync('rimraf', ['prisma/migrations'], { stdio: 'inherit' }); // remove migracoes antigas
        spawn.sync('npm', ['run', 'generate-schema'], { stdio: 'inherit' }); // genre nova migracao
        spawn.sync('npm', ['run', 'migrate'], { stdio: 'inherit' }); // aplica migracao

        console.log("ok")
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }

}


dropCreate()