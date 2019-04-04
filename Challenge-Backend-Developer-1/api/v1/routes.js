let router = require('express').Router();

var personagemController = require('./personagens/controller/personagemController');
router.route('/personagens')
    /**
     * @api {get} /v1/personagens Recupera lista de personagens
     * @apiGroup Personagens
     * @apiVersion  1.0.0
     * @apiParamExample  {json} Request-Example:
     * GET /v1/personagens HTTP/1.1
     * @apiSuccess (200) {Object[]} personagens Lista de personagens
     * @apiSuccess (200) {String} _id Id do personagem
     * @apiSuccess (200) {Date} create_date Data de criação do registro
     * @apiSuccess (200) {String} nome Nome do personagem
     * @apiSuccess (200) {String} raca Raça do personagem
     * @apiSuccess (200) {Number} poder Nível de poder do personagem
     * @apiSuccess (200) {Number} __v Versão do registro
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *      "_id": "5ca2d39e68e445238066b56c",
     *      "create_date": "2019-04-02T03:14:38.218Z",
     *      "nome": "Goku",
     *       "raca": "Sayajin",
     *       "sexo": "Masculino",
     *       "poder": 5000000,
     *       "__v": 0
     *   },
     *   {
     *       "_id": "5ca2d41368e445238066b56d",
     *       "create_date": "2019-04-02T03:16:35.486Z",
     *       "nome": "Vegita",
     *       "raca": "Sayajin",
     *       "sexo": "Masculino",
     *       "poder": 4900000,
     *       "__v": 0
     *   }
     * ]
     */
    .get(personagemController.index)
    /**
     * @api {post} /v1/personagens Adiciona um novo personagem
     * @apiGroup Personagens
     * @apiVersion  1.0.0
     * @apiParam  {String} nome Nome do personagem
     * @apiParam  {String} raca Raça do personagem
     * @apiParam  {String} sexo Sexo do personagem
     * @apiParam  {Number} poder Nível de poder do personagem
     * @apiParamExample  {json} Request-Example:
     * POST /v1/personagens HTTP/1.1
     * Content-Type: application/json
     * {
     *     "nome": "Kurilin",
     *     "raca": "Humano",
     *     "sexo": "Masculino",
     *     "poder": 49000
     * }
     * @apiSuccess (201) {String} Location Header com a localização do recurso inserido
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 201 Created
     * Location: api/personagens/5ca57e04f5505821c4d04874
     */
    .post(personagemController.new);

router.route('/personagens/:personagem_id')
    /**
     * @api {get} /v1/personagens/:personagem_id Recupera um personagem específico
     * @apiGroup Personagens
     * @apiVersion  1.0.0
     * @apiParam  {String} personagem_id Id do personagem a ser recuperado
     * @apiParamExample  {json} Request-Example:
     * GET /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1
     * @apiSuccess (200) {String} _id Id do personagem
     * @apiSuccess (200) {Date} create_date Data de criação do registro
     * @apiSuccess (200) {String} nome Nome do personagem
     * @apiSuccess (200) {String} raca Raça do personagem
     * @apiSuccess (200) {Number} poder Nível de poder do personagem
     * @apiSuccess (200) {Number} __v Versão do registro
     * @apiSuccessExample {Object} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *     "_id": "5ca2d39e68e445238066b56c",
     *     "create_date": "2019-04-02T03:14:38.218Z",
     *     "nome": "Goku",
     *     "raca": "Sayajin",
     *     "sexo": "Masculino",
     *     "poder": 5000000,
     *     "__v": 0
     * }
     * @apiErrorExample {json} Personagem não existe:
         HTTP/1.1 404 Not Found
     */
    .get(personagemController.view)
    /**
     * @api {patch} /personagens/:personagem_id Atualiza parcialmente um personagem
     * @apiGroup Personagens
     * @apiVersion  1.0.0
     * @apiParam  {String} personagem_id Id do personagem a ser atualizado
     * @apiParam  {String} nome Nome do personagem
     * @apiParam  {String} raca Raça do personagem
     * @apiParam  {String} sexo Sexo do personagem
     * @apiParam  {Number} poder Nível de poder do personagem
     * @apiParamExample  {json} Request-Example:
     * PATCH /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1
     * Content-Type: application/json
     * {
     *     "nome": "Goku"
     * }
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 204 No Content
     */
    .patch(personagemController.partialUpdate)
    /**
     * @api {put} /personagens/:personagem_id Atualiza completamente um personagem
     * @apiGroup Personagens
     * @apiVersion  1.0.0
     * @apiParam  {String} personagem_id Id do personagem a ser atualizado
     * @apiParam  {String} nome Nome do personagem
     * @apiParam  {String} raca Raça do personagem
     * @apiParam  {String} sexo Sexo do personagem
     * @apiParam  {Number} poder Nível de poder do personagem
     * @apiParamExample  {json} Request-Example:
     * PUT /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1
     * Content-Type: application/json
     * {
     *     "nome": "Kurilin",
     *     "raca": "Humano",
     *     "sexo": "Masculino",
     *     "poder": 49000
     * }
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 204 No Content
     */
    .put(personagemController.update)
    /**
     * @api {delete} /personagens/:personagem_id Exclui um personagem
     * @apiGroup Personagens
     * @apiVersion  1.0.0
     * @apiParam  {String} personagem_id Id do personagem a ser excluído
     * @apiParamExample  {json} Request-Example:
     * DELETE /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 204 No Content
     */
    .delete(personagemController.delete);

module.exports = router;