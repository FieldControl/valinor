const express = require('express');
const router = express.Router();
const estabelecimentoController = require('../controllers/EstabelecimentoController');
const {getErrors} = require('../middlewares/trataErrors');
const {validaDados, validaDadosPatch} = require('../middlewares/validaDados');

router.get('/resources', getErrors(estabelecimentoController.listaEstabelecimentos));
router.get('/resources/:id', getErrors(estabelecimentoController.estabelecimento));
router.post('/resources', validaDados, getErrors(estabelecimentoController.novoEstabelecimento));
router.put('/resources/:id', validaDados, getErrors(estabelecimentoController.atualizaEstabelecimento));
router.patch('/resources/:id', validaDadosPatch, getErrors(estabelecimentoController.editaEstabelecimento));
router.delete('/resources/:id', getErrors(estabelecimentoController.excluiEstabelecimento));

module.exports = router;