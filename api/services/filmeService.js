const mongoose = require('mongoose');
const Filme = require('../models/Filme');

exports.list = (query) => {
    const skip = (query.page * query.limit) - query.limit;
    return Filme.find(query.where).skip(skip).limit(query.limit);
};

exports.get = (id) => {
    return Filme.findById(id);
};

exports.create = (filme) => {
    return (new Filme(filme)).save();
};

exports.update = async (id, filme) => {
    let filmeBase = await Filme.findById(id);
    
    if (filmeBase) {
        filmeBase.nome = filme.nome;
        filmeBase.genero = filme.genero;
        filmeBase.pais = filme.pais;
        filmeBase.data = filme.data;
    }

    return (new Filme(filmeBase ? filmeBase : filme)).save();
};

exports.patch = (filme) => {
    return Filme.findByIdAndUpdate(filme._id, filme, {new: true, runValidators: true}).exec();
};

exports.delete = (id) => {
    return Filme.findByIdAndDelete(id).exec();
};