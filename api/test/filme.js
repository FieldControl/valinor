process.env.NODE_ENV='test';

const app = require('../config/express')();
const request = require('supertest')(app);
const Filmes = require('../models/Filme');
const assert = require('assert');
const messages = require('../config/messages');

const idExistente1 = '5c9bd3ebf2ca98590c9606e2';
const idExistente2 = '5c9bd3ebf2ca98590c9606e3';
const idInexistente = '5c9bd3ebf2ca98590c9606e4';
let filmeTeste = {
    _id: idExistente1,
    nome: 'Tester',
    genero: 'Teste',
    pais: 'Brasil',
    data: '2018-10-14T00:00:00.000Z',
    __v: 0
};

describe('#filmeController', function() {
    this.timeout(15000);

    before(function() {
        Filmes.collection.drop();
    }); 

    it('#Teste de paginação sem resultados', function(done) {
        request.get('/filmes')
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.PAGINA_NAO_EXISTE);
            })
            .expect(404, done);
    });

    it('#Teste de inserção com dados válidos', function(done) {
        request.post('/filmes')
            .send(filmeTeste)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_INSERIDO);
            })
            .expect(201)
            .end((err, res) => {
                filmeTeste = res.body.data;
                done();
            });
    });

    it('#Teste de paginação com resultados', function(done) {
        request.get('/filmes')
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.data.length, [filmeTeste].length);
                assert.equal(JSON.stringify(res.body.data.pop()), JSON.stringify([filmeTeste].pop()));
            })
            .expect(200, done);
    });

    it('#Teste de paginação com resultados e pagina negativa tratada para virar 1', function(done) {
        request.get('/filmes?page=-1')
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.data.length, [filmeTeste].length);
                assert.equal(JSON.stringify(res.body.data.pop()), JSON.stringify([filmeTeste].pop()));
            })
            .expect(200, done);
    });

    it('#Teste de paginação com resultados e pagina 1', function(done) {
        request.get('/filmes?page=1')
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.data.length, [filmeTeste].length);
                assert.equal(JSON.stringify(res.body.data.pop()), JSON.stringify([filmeTeste].pop()));
            })
            .expect(200, done);
    });

    it('#Teste de paginação com resultados e pagina 2 sem resultados', function(done) {
        request.get('/filmes?page=2')
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.PAGINA_NAO_EXISTE);
            })
            .expect(404, done);
    });

    it('#Teste de inserção sem campo nome', function(done) {
        request.post('/filmes')
            .send({
                genero: 'Teste',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.nome.message, messages.FILME_NOME_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de inserção sem campo genero', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.genero.message, messages.FILME_GENERO_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de inserção sem campo pais', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                genero: 'Teste',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.pais.message, messages.FILME_PAIS_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de inserção sem campo data', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                genero: 'Teste',
                pais: 'Brasil'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.data.message, messages.FILME_DATA_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de inserção com campo nome apenas espaços', function(done) {
        request.post('/filmes')
            .send({
                nome: '   ',
                genero: 'Teste',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.nome.message, messages.FILME_NOME_OBRIGATORIO);
            })
            .expect(400, done);
    });
    
    it('#Teste de inserção com campo genero apenas espaços', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                genero: '   ',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.genero.message, messages.FILME_GENERO_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de inserção com campo pais apenas espaços', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                genero: 'Teste',
                pais: '   ',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.pais.message, messages.FILME_PAIS_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de inserção com campo data abaixo do mínimo', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                genero: 'Teste',
                pais: 'Brasil',
                data: '1888-10-13T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.data.message, messages.FILME_DATA_MIN);
            })
            .expect(400, done);
    });

    it('#Teste de inserção com campo data acima do máximo', function(done) {
        request.post('/filmes')
            .send({
                nome: 'Tester',
                genero: 'Teste',
                pais: 'Brasil',
                data: '2020-01-01T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.data.message, messages.FILME_DATA_MAX);
            })
            .expect(400, done);
    });

    it('#Teste para obter filme por id existente', function(done) {
        request.get(`/filmes/${idExistente1}`)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(JSON.stringify(res.body.data), JSON.stringify(filmeTeste));
            })
            .expect(302, done);
    });

    it('#Teste para obter filme por id não existente', function(done) {
        request.get(`/filmes/${idInexistente}`)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_NAO_ENCONTRADO(idInexistente));
            })
            .expect(404, done);
    });

    it('#Teste para obter filme por id mal formatado', function(done) {
        request.get('/filmes/5c9')
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.message, messages.CAST_ERROR);
            })
            .expect(400, done);
    });

    it('#Teste de atualização de filme válida', function(done) {
        request.put(`/filmes/${idExistente1}`)
            .send({
                nome: 'Tester 2',
                genero: 'Teste',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_ATUALIZADO(idExistente1));
            })
            .expect(302, done);
    });

    it('#Teste de atualização de filme sem nome', function(done) {
        request.put(`/filmes/${idExistente1}`)
            .send({
                genero: 'Teste',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.nome.message, messages.FILME_NOME_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de atualização de filme inexistente para inserir novo', function(done) {
        request.put(`/filmes/${idExistente2}`)
            .send({
                nome: 'Tester 3',
                genero: 'Teste',
                pais: 'Brasil',
                data: '2018-10-14T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_ATUALIZADO(idExistente2));
            })
            .expect(302, done);
    });

    it('#Teste de patch de filme existente', function(done) {
        request.patch(`/filmes/${idExistente1}`)
            .send({
                genero: 'Suspense'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_ATUALIZADO(idExistente1));
                assert.equal(res.body.data.genero, 'Suspense');
            })
            .expect(302, done);
    });

    it('#Teste de patch de filme existente com campo vazio', function(done) {
        request.patch(`/filmes/${idExistente1}`)
            .send({
                genero: ''
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.genero.message, messages.FILME_GENERO_OBRIGATORIO);
            })
            .expect(400, done);
    });

    it('#Teste de patch de filme existente com data acima do máximo', function(done) {
        request.patch(`/filmes/${idExistente1}`)
            .send({
                data: '2020-01-01T00:00:00-00:00'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.error.errors.data.message, messages.FILME_DATA_MAX);
            })
            .expect(400, done);
    });

    it('#Teste de patch de filme inexistente', function(done) {
        request.patch(`/filmes/${idInexistente}`)
            .send({
                genero: 'Suspense'
            })
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_NAO_ENCONTRADO(idInexistente));
            })
            .expect(404, done);
    });

    it('#Teste de deletar filme inexistente', function(done) {
        request.delete(`/filmes/${idInexistente}`)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_NAO_ENCONTRADO(idInexistente));
            })
            .expect(404, done);
    });

    it('#Teste de deletar filme existente', function(done) {
        request.delete(`/filmes/${idExistente1}`)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert.equal(res.body.message, messages.FILME_DELETADO(idExistente1));
            })
            .expect(302, done);
    });
});