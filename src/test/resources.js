/*
 * Arquivo: routes/resources.js
 * Description: Arquivo responsável por realizar o TDD com Mocha &amp;amp;amp; Chai no lado do server da nossa app.
 *
 */

process.env.NODE_ENV = 'test'
const  resources  = require('../models/resources');

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');
var should = chai.should();

chai.use(chaiHttp)

//Aqui é o bloco principal que executará o nossos testes
 
/**
 * Teste da rota: /GET
 */
describe('/GET resources', function() {
    it('Deve retornar todos os recusrso', function(done) {
        chai.request(server)
        .get('/resources')
        .end(function(error, res) {
            console.logo('teste')
        done();
        });
    });
})

