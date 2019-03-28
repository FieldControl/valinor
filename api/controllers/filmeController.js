const filmeService = require('../services/filmeService');
const messages = require('../config/messages');

exports.list = async (req, res) => {
    const page = req.query.page > 0 ? req.query.page : 1;
    let where = {};
    if (req.query.nome) where.nome = req.query.nome;
    if (req.query.genero) where.genero = req.query.genero;
    if (req.query.pais) where.pais = req.query.pais;
    if (req.query.data) where.data = req.query.data;
    const query = {page, where};

    const filmes = await filmeService.list(query);

    if (!filmes.length) {
        res.status(404).json({message: messages.PAGINA_NAO_EXISTE});
    } else {
        res.status(200).json({data: filmes});
    }
};

exports.get = async (req, res) => {
    try {
        const filme = await filmeService.get(req.params.id);

        if (!filme) {
            res.status(404).json({message: messages.FILME_NAO_ENCONTRADO(req.params.id)});
        } else {
            res.status(302).json({data: filme});
        }
    } catch (error) {
        res.status(400).json({error: error});
    }
};

exports.create = async (req, res) => {
    const novoFilme = req.body;
    
    try {
        const filme = await filmeService.create(novoFilme);
        res.status(201).json({data: filme, message: messages.FILME_INSERIDO});
    } catch(error) {
        res.status(400).json({error: error});
    }
}

exports.update = async (req, res) => {
    let filme = req.body;

    try {
        filme = await filmeService.update(req.params.id, filme);
        
        res.status(302).json({data: filme, message: messages.FILME_ATUALIZADO(req.params.id)});
    } catch (error) {
        res.status(400).json({error: error});
    }
};

exports.patch = async (req, res) => {
    let filme = req.body;
    filme._id = req.params.id;

    try {
        filme = await filmeService.patch(filme);

        if (!filme) {
            res.status(404).json({message: messages.FILME_NAO_ENCONTRADO(req.params.id)});
        } else {
            res.status(302).json({data: filme, message: messages.FILME_ATUALIZADO(req.params.id)});
        }
    } catch (error) {
        res.status(400).json({error: error});
    }
};

exports.delete = async (req, res) => {
    try {
        const resultado = await filmeService.delete(req.params.id);

        if (!resultado) {
            res.status(404).json({message: messages.FILME_NAO_ENCONTRADO(req.params.id)});
        } else {
            res.status(302).json({message: messages.FILME_DELETADO(req.params.id)});
        }
    } catch (error) {
        res.status(400).json({data: error});
    }
};