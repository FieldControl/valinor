const mongoose = require('mongoose');
const Filme = require('../models/Filme');
const filmeService = require('../services/filmeService');

exports.list = async (req, res) => {
    const page = req.query.page > 0 ? req.query.page : 1;
    const limit = 5;
    let where = {};
    if (req.query.nome) where.nome = req.query.nome;
    if (req.query.genero) where.genero = req.query.genero;
    if (req.query.pais) where.pais = req.query.pais;
    if (req.query.data) where.data = req.query.data;
    const query = {limit, page, where};

    const filmes = await filmeService.list(query);

    if (!filmes.length) {
        res.status(404).json({message: "A pagina solicitada não existe"});
    } else {
        res.status(200).json({data: filmes});
    }
};

exports.get = async (req, res) => {
    try {
        const filme = await filmeService.get(req.params.id);

        if (!filme) {
            res.status(404).json({message: `Filme com id ${req.params.id} não encontrado.`});
        } else {
            res.status(302).json({data: filme});
        }
    } catch (error) {
        res.status(400).json({error: error});
    }
};

exports.create = async (req, res) => {
    const novoFilme = req.body;

    const filme = await filmeService.create(novoFilme);
    
    res.status(201).json({data: filme, message: 'Inserido novo filme.'});
}

exports.update = async (req, res) => {
    let filme = req.body;

    try {
        filme = await filmeService.update(req.params.id, filme);
        
        res.status(302).json({data: filme, message: `Filme com id ${req.params.id} atualizado.`});
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
            res.status(404).json({message: `Filme com id ${req.params.id} não encontrado.`});
        } else {
            res.status(302).json({data: filme, message: `Filme com id ${req.params.id} atualizado.`});
        }
    } catch (error) {
        res.status(400).json({error: error});
    }
};

exports.delete = async (req, res) => {
    try {
        const resultado = await filmeService.delete(req.params.id);

        if (!resultado) {
            res.status(404).json({status: `Filme com id ${req.params.id} não encontrado.`});
        } else {
            res.status(302).json({status: `Filme com id ${req.params.id} deletado com sucesso.`});
        }
    } catch (error) {
        res.status(400).json({data: error});
    }
};