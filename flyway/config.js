

function credentialsFromEnv() {
    const connectionString = process.env.GQL_DATABASE_URL

    // exemple url mysql://user:pass@host:port/database?reconnect=true
    const url = "mysql://" + connectionString.split('@')[1]
    const user = connectionString.split("://")[1].split(":")[0]
    const password = connectionString.split("://")[1].split(":")[1].split("@")[0]
    const host = connectionString.split("@")[1].split(":")[0]
    return {
        host,
        url,
        user,
        password
    }

}


const credentials = credentialsFromEnv();

module.exports = {
    flywayArgs: {
        url: credentials.url,
        user: credentials.user,
        password: credentials.password,
        locations: 'filesystem:flyway/migations',
        sqlMigrationSuffixes: '.sql',
    }
};