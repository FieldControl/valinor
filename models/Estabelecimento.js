const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const estabelecimentoSchema = new mongoose.Schema({
    est_nome: {
        type: String,
        trim: true,
        required: 'Nome do estabelecimento deve ser preenchido'
    },
    est_descricao: {
        type: String,
        trim: true
    },
    est_endereco: {
        type: String,
        trim: true,
        required: 'O Endereço do estabelecimento deve ser fornecido'
    },
    est_telefone: {
        type: Number,
        required: 'O Telefone do estabelecimento deve ser fornecedio'
    }
});


module.exports = mongoose.model('Estabelecimento', estabelecimentoSchema);