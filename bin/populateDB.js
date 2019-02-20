const mongoose = require('mongoose')
const config = require('../src/config')
const Games = require('../src/models/games')
const url = config.db.database

// Popula o banco dados
mongoose.connect(url, {
  useNewUrlParser: true
})
async function popularBanco () {
  const games = [{
    '_id': '5c5b863190716a211cb81d88',
    'nome': 'Fortnite',
    'produtora': 'Epic Games',
    'categoria': 'Survival',
    'preço': 0
  },
  {
    '_id': '5c5b863190716a211cb81d89',
    'nome': 'League of Legends',
    'produtora': 'Riot Games',
    'categoria': 'Multiplayer online battle arena',
    'preço': 0
  },
  {
    '_id': '5c5b863190716a211cb81d90',
    'nome': 'Counter-Strike',
    'produtora': 'Valve',
    'categoria': 'First Person Shooter - FPS',
    'preço': 29.9
  }
  ]
  await Games.deleteMany({})
  await Games.insertMany(games)
  console.log('---------------- BANCO DE DADOS TESTE POPULADO COM SUCESSO! ----------------')
}

popularBanco()
