const pg = require('pg')

// const client = new pg.Client({
//    user:'postgres',
//    host:'localhost',
//    database:'meudb',
//    password:'123456',
//    port:5432
// })
const client = new pg.Client({
   user:'postgres',
   host:'containers-us-west-199.railway.app',
   database:'railway',
   password:'nJUs1gasUCJp1F9H9P1f',
   port:7141
})

module.exports = client