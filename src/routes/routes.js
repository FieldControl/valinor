const express = require('express')
const router = express.Router()
const controller = require('../controllers/gamesController')

// Rotas da API
router.get('/resources', controller.get)
router.get('/resources/:id', controller.getId)
router.post('/resources', controller.post)
router.put('/resources/:id', controller.put)
router.patch('/resources/:id', controller.patch)
router.delete('/resources/:id', controller.delete)

module.exports = router
