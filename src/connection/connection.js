// Conexão com o banco de dados
const mongoose = require('mongoose')
const config = require('../../src/config')
const url = config.db.database
mongoose.connect(url, {
  useNewUrlParser: true
})
const connection = mongoose.connection.on('error', (error) => {
  console.error(error)
})
module.exports = connection
