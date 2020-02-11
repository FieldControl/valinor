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
                return con.query("truncate table _Migration")
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
            console.log("drop tanle " + table)
            return con.query("drop table " + table)
        })
    )
}

function tableNames(con, databaseName) {
    console.log(databaseName);
    let tablesQuery = `SELECT table_name FROM information_schema.tables
                            WHERE table_schema = ? AND TABLE_NAME NOT LIKE "_Migration"`
    return con.query(tablesQuery, [databaseName]).then(result => {
        console.log(result)
        return result;
    })
}


