const api = require('./../src/app')
const request = require('supertest')(api)
const test = require('ava')
const populateDb = require('../bin/populateDB')

// Testes unitários do CRUD

test.beforeEach(async t => {
  await populateDb
})

test('get para node/resources retorna todos os games', async t => {
  let response = await request.get('/node/resources')
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, [{
    _id: '5c5b863190716a211cb81d88',
    nome: 'Fortnite',
    produtora: 'Epic Games',
    categoria: 'Survival',
    'preço': 0,
    __v: 0
  },
  {
    _id: '5c5b863190716a211cb81d89',
    nome: 'League of Legends',
    produtora: 'Riot Games',
    categoria: 'Multiplayer online battle arena',
    'preço': 0,
    __v: 0
  },
  {
    _id: '5c5b863190716a211cb81d90',
    nome: 'Counter-Strike',
    produtora: 'Valve',
    categoria: 'First Person Shooter - FPS',
    'preço': 29.9,
    __v: 0
  }
  ])
})

test('getId para node/resources/:id retorna o game válido para o id', async t => {
  let response = await request.get('/node/resources/5c5b863190716a211cb81d88')
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, [{
    _id: '5c5b863190716a211cb81d88',
    nome: 'Fortnite',
    produtora: 'Epic Games',
    categoria: 'Survival',
    'preço': 0,
    __v: 0
  }])
})

test('patch para node/resources/:id para editar parcialmente os dados de um game', async t => {
  let response = await request.patch('/node/resources/5c5b863190716a211cb81d89')
    .send({
      'nome': 'Tibia',
      'produtora': 'Cipsoft'
    })
  t.deepEqual(response.body, [{
    _id: '5c5b863190716a211cb81d89',
    nome: 'Tibia',
    produtora: 'Cipsoft',
    categoria: 'Multiplayer online battle arena',
    'preço': 0,
    __v: 0
  }])
})

test('put para node/resources/id para atualizar todos os dados de um game', async t => {
  let response = await request.put('/node/resources/5c5b863190716a211cb81d88')
    .send({
      '_id': '5c5b863190716a211cb81d88',
      'nome': 'NBA 2K19',
      'produtora': '2K Games',
      'categoria': 'Não sei',
      'preço': 149.9,
      '__v': 0
    })
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, {
    '_id': '5c5b863190716a211cb81d88',
    'nome': 'NBA 2K19',
    'produtora': '2K Games',
    'categoria': 'Não sei',
    'preço': 149.9,
    '__v': 0
  })
})

test('post para node/resources/ para inserir um game', async t => {
  let response = await request.post('/node/resources')
    .send({
      '_id': '5c5b863190716a211cb81d91',
      'nome': 'Battlefield 4',
      'produtora': 'EA Games',
      'categoria': 'First Person Shooter - FPS',
      'preço': 199.9,
      '__v': 0
    })
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, [{
    _id: '5c5b863190716a211cb81d91',
    nome: 'Battlefield 4',
    produtora: 'EA Games',
    categoria: 'First Person Shooter - FPS',
    'preço': 199.9,
    __v: 0
  }])
})

test('delete para node/resources/:id deleta um game', async t => {
  let response = await request.delete('/node/resources/5c5b863190716a211cb81d88')
  t.deepEqual(response.statusCode, 200)
})
