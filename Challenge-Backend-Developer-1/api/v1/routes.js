let router = require('express').Router();

var personagemController = require('./personagens/controller/personagemController');
router.route('/personagens')
    .get(personagemController.index)
    .post(personagemController.new);

router.route('/personagens/:personagem_id')
    .get(personagemController.view)
    .patch(personagemController.partialUpdate)
    .put(personagemController.update)
    .delete(personagemController.delete);

module.exports = router;