require('dotenv').config({ path:__dirname + '../config/variables.env' });
const mongoose = require('mongoose');
const Estabelecimento = require('../models/Estabelecimento');
mongoose.connect('mongodb://admin:admin123@ds159926.mlab.com:59926/ticketalimentacao-test', {useNewUrlParser: true, useFindAndModify: false});
mongoose.Promise = global.Promise;

/**
 * Método responsável por deletar todos os documentos do banco de teste
 */
exports.apagaDados = () => {
    return Estabelecimento.deleteMany({});
}

const estabelecimentos = [
    {
        "_id":"58c039938060197ca0b52d4d",
        "est_nome": "Madero Steak House",
        "est_descricao": "Steak House com ótimos hamburgues",
        "est_endereco": "Av. Pres. Juscelino K. de Oliveira, 5000",
        "est_telefone": 1732349542
    },
    {
        "_id":"58c039ee8060197ca0b52d4e",
        "est_nome": "Outback",
        "est_descricao": "Steak House com uma ótima picanha",
        "est_endereco": "Av. Pres. Juscelino K. de Oliveira, 5000",
        "est_telefone": 1732018587
    }
];

/**
 * Método responsável por inserir documentos no banco de teste
 */
exports.carregaDados = () => {
    return Estabelecimento.insertMany(estabelecimentos);
}