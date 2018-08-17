var app = require('../config/custom-express')();
var request = require('supertest')(app);
var assert = require('assert');


describe('#ResourcesController',function(){

    beforeEach(function(done){
        let service = new app.services.ResourceService(app);

        // Deleta todo Banco de Testes "resource_db_teste"
        service.deletaTodosResourcesBD(err => {

            // Inicializa o Banco de testes com 4 items
            service.inicializaResourcesBDTeste(err => {
                done();
            });
    
        });

    });

    it('# Listagem Resources',function(done){       
        request.get('/resources')
                    .set('Accept','application/json')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
    });

    it('# Recuperar Resources Com id Válido',function(done){       
        request.get('/resources/4')
                    .set('Accept','application/json')
                    .expect('Content-Type', /json/)
                    .expect(res=>{
                        assert.equal(res.body[0].nome,"Pessoa");
                    })
                    .expect(200, done);
    });

    it('# Recuperar Resources Com id Inválido',function(done){       
        request.get('/resources/5000')
                    .set('Accept','application/json')
                    .expect('Content-Type', /json/)
                    .expect(404, done);
    });

    it('# Listagem Resources Paginada',function(done){       
        request.get('/resources?page=1&limit=2')
                    .set('Accept','application/json')
                    .expect('Content-Type', /json/)
                    .expect( res => {
                        assert.equal(res.body.length, 2)
                    })
                    .expect(200, done);
    });

    it('# Cadastro de Resource com dados Válidos',function(done){       
        request.post('/resources')
                    .send({
                        nome: "Luiz Frenenda", 
                        email: "freneda@gmail.com"
                    })
                    .expect(201, done);
    });

    it('# Cadastro de Resource com dados Inváidos',function(done){       
        request.post('/resources')
                    .send({
                        email: "freneda@gmail.com"
                    })
                    .expect(400, done);
    });

    it('# Update de Resource com dados Válidos',function(done){       
        request.put('/resources/3')
                    .send({nome: "Luiz Frenenda", email: "freneda@gmail.com"})
                    .expect( res => {
                        assert.equal(res.body.data.status, "UPDATE")
                    })
                    .expect(200, done);
    });

    it('# Update de Resource com dados Inválidos',function(done){       
        request.put('/resources/3')
                    .send({
                        nome: "Luiz Frenenda", 
                        email: "frenedagmail.com"
                    })
                    .expect(400, done);
    });

});