const express = require('express')
const server = express()

server.use(express.static('public'))

server.set('view engine', 'html');

server.get('/', (req, res) => {
  return res.render('index.html')
})

server.listen(5000, function () {
  console.log("Server is running")
})