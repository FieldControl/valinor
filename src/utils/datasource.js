
async function dropTable (con, table) {
  console.log('drop table ' + table)
  return con.query('drop table ' + table)
}

async function truncateTable (con, table) {
  console.log('truncate table ' + table)
  return con.query('truncate table ' + table)
}

async function enableForeignKeyChecks (con) {
  return con.query('set session foreign_key_checks = 1')
}

async function disableForeignKeyChecks (con) {
  return con.query('set session foreign_key_checks = 0')
}

async function truncateTables (con, tables) {
  await disableForeignKeyChecks(con)
  await Promise.all(tables.map(table => truncateTable(con, table)))
  await enableForeignKeyChecks(con)
}

async function dropTables (con, tables) {
  await disableForeignKeyChecks(con)
  await Promise.all(tables.map(table => dropTable(con, table)))
  await enableForeignKeyChecks(con)
}

async function tableNames (con, databaseName) {
  const result = await con.query('SELECT table_name as tableName FROM information_schema.tables WHERE table_schema = ?', [databaseName])
  return result.map(data => data.tableName)
}

async function createTableMigration (con) {
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

module.exports = {
  dropTables,
  tableNames,
  createTableMigration,
  truncateTables
}
