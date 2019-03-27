const mongoose = require('mongoose');

var filmeSchema = mongoose.Schema({
    nome: {
        type: String, 
        required: "Nome do filme deve ser fornecido.",
        trim: true 
    },
    genero: {
        type: String, 
        required: "Gênero do filme deve ser fornecido.", 
        trim: true 
    },
    pais: {
        type: String, 
        required: "País de origem do filme deve ser fornecido.", 
        trim: true 
    },
    data: {
        type: Date, 
        required: "Data de lançamento do filme deve ser fornecido.",
        min: ["1888-10-14T00:00:00.000Z", "O filme não pode ser anterior ao mais antigo catalogado."],
        max: [new Date(), "Apenas filmes já lançados são aceitos."]
    }
});

module.exports = mongoose.model('Filmes', filmeSchema);