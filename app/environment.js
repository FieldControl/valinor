const appPort = 3000;
module.exports = Object.freeze({
    mysql: {
        user: 'valinor_user',
        password: 'valinor_pass',
        port: '3306',
        database: 'valinor_db',
        host: 'localhost'
    },
    app: {
        port: appPort,
        url: `http://localhost:${appPort}`
    }
});
