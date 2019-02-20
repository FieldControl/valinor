const express = require('express')
const router = express.Router()

router.get('/', function (req, res, nex) {
  res.status(200).send({
    title: 'API BACKEND CHALLENGE FOR GAMES',
    version: '0.0.1'
  })
})

module.exports = router
