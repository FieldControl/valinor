var mongoose = require('mongoose');

var personagemSchema = mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    raca: {
        type: String,
        required: true
    },
    sexo: {
        type: String,
        required: true
    },
    poder: {
        type: Number,
        required: true
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

var Personagem = module.exports = mongoose.model('personagem', personagemSchema);
module.exports.get = function (callback, limit) {
    Personagem.find(callback).limit(limit);
}