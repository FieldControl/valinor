const mongoose = require('mongoose')
mongoose.Promise = global.Promise

// Modelo da tabela games
const games = new mongoose.Schema({
  nome: {
    type: String,
    trim: true,
    required: 'Nome do jogo é obrigatório.'
  },
  produtora: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    trim: true,
    required: 'Categoria é obrigatório.'
  },
  preço: {
    type: Number,
    required: 'Preço é obrigatório.'
  }
})
module.exports = mongoose.model('Games', games)
