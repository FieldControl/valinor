function ResourceService(app) {
    this._connection = app.dao.connectionFactory();
    this._resourceDao = new app.dao.ResourceDao(this._connection);
}

/**
 * Lista todos os Resources com paginação "/resources?page=1&limit=10"
 * @param {Query Parameters da URL} query 
 * @param {Callback Function} callback 
 */
ResourceService.prototype.listaTodos = function(query, callback) {
    
    // Getting the url query like: /resources?page=1&limit=20
    var page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    
    var limit = parseInt(query.limit, 10);
    if (isNaN(limit)) {
        limit = 10;
    } else if (limit > 50) {
        limit = 50;
    } else if (limit < 1) {
        limit = 1;
    }

    this._resourceDao.lista(page, limit, callback);
}

/**
 * Buscar Resource por Id
 * @param {Parâmetros da URL} params 
 * @param {Callback Function} callback 
 */
ResourceService.prototype.buscaPorId = function(params, callback) {
    let id = params.id;
    this._resourceDao.buscaPorId(id, callback);
}

/**
 * Persistencia do Resource na Base
 * @param {Request} req 
 * @param {Callback Function} callback 
 */
ResourceService.prototype.salva = function(req, callback){
    let resource = req.body;        
    resource.status = 'CRIADO';
    resource.data = new Date;

    this._resourceDao.salva(resource, callback);
    return resource;
}

/**
 * Excluir Resource do Banco - Atualizar seu status para "EXCLUIDO"
 * @param {Requisição} req 
 * @param {Callback Function} callback 
 */
ResourceService.prototype.excluir = function(req, callback) {
    let resource = {};
    let id = req.params.id;

    resource.id = id;
    resource.status = "EXCLUIDO";

    this._resourceDao.atualiza(resource, callback);

    return resource;
}

/**
 * Atualização do Resource
 * @param {Request} req 
 * @param {Callback Function} callback 
 */
ResourceService.prototype.atualiza = function(req, callback) {
    let resource = req.body;
    let id = req.params.id;

    resource.id = id;
    resource.status = "UPDATE";
    resource.data = new Date;

    this._resourceDao.atualiza(resource, callback);

    return resource;
}

/**
 * Validação para PUT e POST, uma vez que esses recebem toda entidade.
 * @param {Request} req 
 */
ResourceService.prototype.validar = function(req){
    req.assert("nome", "O atributo nome é Obrigatório!").notEmpty();
    req.assert("nome", "O nome deve ter pelo menos três caracteres!").isLength({ min: 3 });
    req.assert("email", "O atributo e-mail é Obrigatório!").notEmpty();
    req.assert("email", "O e-mail não está no formato correto, favor verificar.").isEmail();  

    return req.validationErrors();
}

/**
 * Deleta todo os dados do Banco de dados de teste
 */
ResourceService.prototype.deletaTodosResourcesBD = function(callback){
    this._resourceDao.deletaTodosResourcesBD(callback);
}

/**
 * Inicializa o Banco de dados de Teste com alguns valores
 */
ResourceService.prototype.inicializaResourcesBDTeste = function(callback) {
    this._resourceDao.inicializaResourcesBDTeste(callback);
}

module.exports = function(){
    return ResourceService;
};