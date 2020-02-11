const mysql = require('promise-mysql')
const rimraf = require("rimraf");
const spawn = require('cross-spawn');


function credentialsFromEnv() {
    // exemple url mysql://user:pass@host:port/database?reconnect=true
    const connectionString = process.env.GQL_DATABASE_URL

    const url = "mysql://" + connectionString.split('@')[1]
    const user = connectionString.split("://")[1].split(":")[0]
    const password = connectionString.split("://")[1].split(":")[1].split("@")[0]
    const host = connectionString.split("@")[1].split(":")[0]
    const database = connectionString.split("@")[1].split("/")[1].split("?")[0]
    return {
        host,
        url,
        user,
        password,
        database
    }
}

const credentials = credentialsFromEnv();

console.log(credentials)
mysql.createConnection({ ...credentials })
    .then(con => {
        return tableNames(con, credentials.database)
            .then((tableNames) => dropTables(con, tableNames.map(data => { data.table_name })))
            .then(() => createTableMigration(con))
            .then(() => {
                // console.log(package)
                // Spawn NPM synchronously
                spawn.sync('rimraf', ['prisma/migrations'], { stdio: 'inherit' }); // remove migracoes antigas
                spawn.sync('npm', ['run', 'generate-schema'], { stdio: 'inherit' }); // genre nova migracao
                spawn.sync('npm', ['run', 'migrate'], { stdio: 'inherit' }); // aplica migracao

            })
    }).catch(error => {
        console.log(error)
        process.exit(1)
    }).then(() => {
        console.log("ok")
        process.exit(0)
    })

function toDropTablePrimisse(con, table) {
    console.log("drop table " + table)
    return con.query("drop table " + table)
}

function dropTables(con, tables) {
    return con.query("set session foreign_key_checks = 0")
        .then(() => Promise.all(tables.map(table => toDropTablePrimisse(con, table))))
        .then(() => con.query("set session foreign_key_checks = 1"))
}

function tableNames(con, databaseName) {
    let tablesQuery = `SELECT table_name FROM information_schema.tables
                            WHERE table_schema = ?`
    return con.query(tablesQuery, [databaseName]).then(result => {
        return result;
    })
}

function createTableMigration(con) {
    const createTableMigration = `CREATE TABLE _Migration (
        revision INT(11) NOT NULL AUTO_INCREMENT,
        name TEXT NOT NULL COLLATE 'utf8_unicode_ci',
        datamodel LONGTEXT NOT NULL COLLATE 'utf8_unicode_ci',
        status TEXT NOT NULL COLLATE 'utf8_unicode_ci',
        applied INT(11) NOT NULL,
        rolled_back INT(11) NOT NULL,
        datamodel_steps LONGTEXT NOT NULL COLLATE 'utf8_unicode_ci',
        database_migration LONGTEXT NOT NULL COLLATE 'utf8_unicode_ci',
        errors LONGTEXT NOT NULL COLLATE 'utf8_unicode_ci',
        started_at DATETIME(3) NOT NULL,
        finished_at DATETIME(3) NULL,
        PRIMARY KEY (revision) USING BTREE
    )
    COLLATE='utf8_unicode_ci'
    ENGINE=InnoDB`

    console.log(createTableMigration)

    return con.query(createTableMigration)
}


