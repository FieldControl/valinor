module.exports = {
    flywayArgs: {
        url: 'jdbc:mysql://g3v9lgqa8h5nq05o.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/c572ymepzv3e1tq5',
        locations: 'filesystem:flyway/migations',
        user: 'tsv0j2hl5m7q14l2',
        password: 'y1uzfzvtvo7kuwhp',
        sqlMigrationSuffixes: '.sql',
    },
    // Use to configure environment variables used by flyway
    env: {
        JAVA_ARGS: '-Djava.util.logging.config.file=./conf/logging.properties',
    },
    downloads: {
        storageDirectory: '/var/test', // optional, the specific directory to store the flyway downloaded files. The directory must be writable by the node app process' user.
        expirationTimeInMs: -1, // optional, -1 will never check for updates, defaults to 1 day.
    }
};