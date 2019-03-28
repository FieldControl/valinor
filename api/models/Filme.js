const mongoose = require('mongoose');
const messages = require('../config/messages');
const constants = require('../config/constants');

var filmeSchema = mongoose.Schema({
    nome: {
        type: String, 
        required: messages.FILME_NOME_OBRIGATORIO,
        trim: true 
    },
    genero: {
        type: String, 
        required: messages.FILME_GENERO_OBRIGATORIO, 
        trim: true 
    },
    pais: {
        type: String, 
        required: messages.FILME_PAIS_OBRIGATORIO, 
        trim: true 
    },
    data: {
        type: Date, 
        required: messages.FILME_DATA_OBRIGATORIO,
        min: [constants.DATA_MIN, messages.FILME_DATA_MIN],
        max: [new Date(), messages.FILME_DATA_MAX]
    }
});

module.exports = mongoose.model('Filmes', filmeSchema);