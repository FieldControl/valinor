const { exec } = require('child_process');
require('dotenv').config(__dirname + '/.env');

exec(`node ./node_modules/sequelize-auto/bin/sequelize-auto -o "./src/models" -d ${process.env.DB_NAME} -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p ${process.env.DB_PORT} -x ${process.env.DB_PASSWORD} -e ${process.env.DB_DRIVER} -a .sequelize-auto.cfg.js`, (err, stdout, stderr) => {

    if(stderr)
        return console.error(stderr);
    if(err)
        return console.error(err);
    
    console.log(stdout);
});
