const mongoose = require('mongoose');

var filmeSchema = mongoose.Schema({
    nome: {type: String, required: true, trim: true },
    genero: {type: String, required: true, trim: true },
    pais: {type: String, required: true, trim: true },
    data: {type: Date, required: true}
});

module.exports = mongoose.model('Filmes', filmeSchema);