const mongoose = require('mongoose');
const Estabelecimento = mongoose.model('Estabelecimento');


/**
 * Método responsável por realizar a consulta página do recurso.
 * @param query objeto contendo o limitador da consulta e quantos itens serão pulados definindo assim
 * um intervalo de itens que serão retornados.
 * @returns Promise da consulta realizada.
 */
exports.listaEstabelecimentos = (query) => {
    return Estabelecimento.find().skip(query.skip).limit(query.limit).exec();
}

/**
 * Método responsável por realizar a consulta de um recurso específico com base no seu id.
 * @param id id do estabelecimento a ser consultado.
 * @returns Promise da consulta realizada.
 */
exports.estabelecimento = (id) => {
    return Estabelecimento.findOne({_id: id}).exec();
}

/**
 * Método responsável por salvar um novo Estabelecimento.
 * @param novoEstabelecimento entidade a ser persistida.
 * @returns Promise da consulta realizada.
 */
exports.novoEstabelecimento = (novoEstabelecimento) => {
    return (new Estabelecimento(novoEstabelecimento)).save();
}

/**
 * Método responsável por realizar a atualização completa de um recurso caso ele exista no banco,
 * e se caso não exista, é criado um novo recurso.
 * @param estabelecimento entidade a ser atualizada
 * @returns Promise da consulta realizada.
 */
exports.atualizaEstabelecimento = (estabelecimento) => {
    mongoose.set('useFindAndModify', false);

    return Estabelecimento.findOneAndUpdate({_id: estabelecimento._id}, estabelecimento, {new: true, runValidators: true, upsert: true});
}


/**
 * Método responsável por realizar a atualização parcial de um recurso caso ele exista no banco.
 * @param estabelecimento entidade a ser atualizada
 * @returns Promise da consulta realizada.
 */
exports.editaEstabelecimento = (estabelecimento) => {
    return Estabelecimento.findOneAndUpdate({_id: estabelecimento._id}, estabelecimento, {new: true, runValidators: true});
}

/**
 * Método responsável por excluir um recurso do banco.
 * @param id identificador do recurso a ser exlcuido do banco.
 * @returns Promise da consulta realizada.
 */
exports.excluiEstabelecimento = (id) => {
    return Estabelecimento.deleteOne({_id: id}).exec();
}