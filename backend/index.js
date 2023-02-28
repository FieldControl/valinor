const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const routes = require('./config/routes')
const db = require('./src/data/arquivo')

app.use(express.json())
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
   res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
   app.use(cors());
   next();
})
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(routes)


app.listen(3000, () => {
   db.connect()
   console.log('http://localhost:3000')
})

module.exports = app