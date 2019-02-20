const express = require('express')
const app = express()
const Router = express.Router()
const bodyParser = require('body-parser')

// Rotas
const index = require('./routes/index')
const routes = require('./routes/routes')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.use('/', index)
app.use('/node', routes)

module.exports = app
