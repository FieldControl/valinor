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
            .then(tableNames => {
                return con.query("set session foreign_key_checks = 0")
                    .then(() => {
                        return tableNames;
                    })
            })
            .then((tableNames) => {
                const tables = tableNames.map(data => {
                    return data.table_name
                })

                console.log(tableNames)
                return dropTables(con, tables)

            })
            .then(tableNames => {
                return con.query("set session foreign_key_checks = 1")
                    .then(() => {
                        return tableNames;
                    })
            })
            .then(tableNames => {

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
                    .then(() => {
                        return tableNames;
                    })
            }).then(() => {

                console.log("teste 1")
                let result = rimraf("prisma/migrations", error => {


                    console.log(error)
                })

                // console.log(package)
                // Spawn NPM synchronously
                spawn.sync('rimraf', ['prisma/migrations'], { stdio: 'inherit' });
                spawn.sync('npm', ['run', 'generate-schema'], { stdio: 'inherit' });
                spawn.sync('npm', ['run', 'migrate'], { stdio: 'inherit' });

            })
    }).catch(error => {
        console.log(error)
        process.exit(1)
    }).then(() => {
        console.log("ok")
        process.exit(0)
    })

function dropTables(con, tables) {
    console.log(tables)
    return Promise.all(
        tables.map(table => {
            console.log("drop table " + table)
            return con.query("drop table " + table)
        })
    )
}

function tableNames(con, databaseName) {
    let tablesQuery = `SELECT table_name FROM information_schema.tables
                            WHERE table_schema = ?`
    return con.query(tablesQuery, [databaseName]).then(result => {
        return result;
    })
}


