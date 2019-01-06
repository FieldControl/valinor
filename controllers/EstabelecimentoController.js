const estabelecimentoService = require('../services/estabelecimentoService');

/**
 * Método responsável por realizar a consulta páginada do recurso. Caso a página requisitada não seja encontrada,
 * é retornado uma mensagem de erro e o status 404.
 */
exports.listaEstabelecimentos = async (req, res) => {
    const page = req.query.page || 1;
    const limit = 4;
    const skip = (page * limit) - limit;
    const query = {limit, skip, page};

    const estabelecimentos = await estabelecimentoService.listaEstabelecimentos(query);

    if(!estabelecimentos.length && query.skip){
        res.status(404).json({erro: 'Essa página não existe'});
        return;
    }

    res.status(200).json({data:estabelecimentos});
}

/**
 * Método responsável por consultar um estabelecimento específico. Caso o estabelecimento seja encontrado,
 * o mesmo será retornado junto com o status 200.
 */
exports.estabelecimento = async (req, res, next) => {

    const estabelecimento = await estabelecimentoService.estabelecimento(req.params.id);

    if(!estabelecimento){
        res.status(404).json({status:`Resource com id: ${req.params.id} não existe`});
        return;
    }

    res.status(200).json({data: estabelecimento});
}

/**
 * Método responsável por criar um novo recurso no banco de dados. Caso o objeto seja persistido com sucesso ele será
 * retornado com o status 201.
 */
exports.novoEstabelecimento = async (req, res) => {
    const novoEstabelecimento = req.body;

    const estabelecimento = await estabelecimentoService.novoEstabelecimento(novoEstabelecimento);
    
    res.status(201).json({data: estabelecimento, status: 'Criado novo estabelecimento'});
}

/**
 * Método responsável por realizar a atualização completa do objeto, e caso esse objeto ainda não exista ele será criado.
 * 
 */
exports.atualizaEstabelecimento = async (req, res) => {
    const estabelecimento = req.body;
    estabelecimento._id = req.params.id || new mongoose.mongo.ObjectID();

    const novoEstabelecimento = await estabelecimentoService.atualizaEstabelecimento(estabelecimento);
    
    res.status(200).json({data: novoEstabelecimento});
}

/**
 * Método responsável por realizar a atualização parcial das propriedades do recurso.
 * 
 */
exports.editaEstabelecimento = async (req, res) => {
    const estabelecimento = req.body;
    estabelecimento._id = req.params.id;
    
    const estabelecimentoAtualizado = await estabelecimentoService.editaEstabelecimento(req.body);

    if(!estabelecimentoAtualizado){
        res.status(404).json({status:`Resource com id: ${estabelecimento._id} não existe`});
        return;
    }

    res.status(200).json({data: estabelecimentoAtualizado});
}

/**
 * Método responsável por realizar a exclusão de um recurso. Caso a exclusão seja bem sucedida,
 * é retornado uma mensagem e o código 200 confirmando a exclusão.
 */
exports.excluiEstabelecimento = async (req, res) => {
    await estabelecimentoService.excluiEstabelecimento(req.params.id);

    res.status(200).json({status: `O Estabelecimento foi excluido` });
}