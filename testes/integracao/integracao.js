const app = require('../../config/app');
const request = require('supertest')(app);
const expect = require('chai/register-expect');
const assert = require('assert');
const { apagaDados, carregaDados } = require('../../data/dadosBancoTest');


//Dados utilizados nos testes
const idInexistente = '58c039938060197ca0b52d4f'
const estabelecimentoPadrao = {
    _id: '58c039938060197ca0b52d4d',
    est_nome: "Madero Steak House",
    est_descricao: "Steak House com ótimos hamburgues",
    est_endereco: "Av. Pres. Juscelino K. de Oliveira, 5000",
    est_telefone: 1732349542
};

describe('Teste de integração da aplicação', function () {
    this.timeout(15000); //configuração para setar o timeout de todos os testes de integração para 15s

    beforeEach(async () => {
        try {
            await apagaDados();
            await carregaDados();

        } catch (error) {
            console.log(error);
        }

    });


    it('Testa a listagem dos recursos', (done) => {
        this.timeout(20000); //configuração para setar o timeout desse teste em específico para 20s.

        request.get('/resources')
            .expect(res => {
                assert.equal(res.body.data.length, 2);
            })
            .expect(200, done);
    });


    it('Testa a listagem dos recursos com paginação', (done) => {
        this.timeout(20000);
        request.get('/resources?page=1')
            .expect(res => {
                assert.equal(res.body.data.length, 2);
            })
            .expect(200, done);
    });


    it('Testa a listagem dos recursos com paginação inválida', (done) => {
        this.timeout(20000);
        request.get('/resources?page=-1')
            .expect(res => {
                assert.equal(res.body.status, 'Informe um número maior que zero');
            })
            .expect(500, done);
    });


    it('Testa a listagem dos recursos com pagina não encontrada', (done) => {
        this.timeout(20000);
        request.get('/resources?page=2')
            .expect(res => {
                assert.equal(res.body.erro, 'Essa página não existe');
            })
            .expect(404, done);
    });


    it('Testa a listagem de um recurso específico', (done) => {
        request.get(`/resources/${estabelecimentoPadrao._id}`)
            .expect(res => {
                assert.equal(res.body.data._id, estabelecimentoPadrao._id)
                assert.equal(res.body.data.est_nome, estabelecimentoPadrao.est_nome)
            })
            .expect(200, done);
    });


    it('Testa a listagem de um recurso específico inexistente no banco', (done) => {
        request.get(`/resources/${idInexistente}`)
            .expect(res => {
                assert.equal(res.body.status, `Resource com id: ${idInexistente} não existe`);
            })
            .expect(404, done);
    });


    it('Testa a criação um novo recurso', (done) => {
        const fieldControl = {
            est_nome: 'Field Control',
            est_descricao: 'Um lugar legalzinho',
            est_endereco: ' R. XV de Novembro, 4353',
            est_telefone: 17321727071
        };

        request.post(`/resources`)
            .send(fieldControl)
            .expect(201, done);
    });


    it('Testa a criação um novo recurso inválido', (done) => {
        const fieldControl = {
            est_nome: 'Field Control',
            est_descricao: 'Um lugar legalzinho',
            est_endereco: ' R. XV de Novembro, 4353',
            est_telefone: 123123123123123123
        };

        request.post(`/resources`)
            .send(fieldControl)
            .expect(res => {
                assert.equal(res.body[0].msg, "Deve ser fornecido um telefone");
            })
            .expect(500, done);
    });


    it('Testa a atualização total de um recurso específico', (done) => {
        const fieldControl = {
            est_nome: 'Field Control',
            est_descricao: 'Um lugar legalzinho',
            est_endereco: ' R. XV de Novembro, 4353',
            est_telefone: 17321727071
        };

        request.put(`/resources/${estabelecimentoPadrao._id}`)
            .send(fieldControl)
            .expect(200, done);
    });


    it('Testa a atualização parcial de um recurso específico', (done) => {
        request.patch(`/resources/${estabelecimentoPadrao._id}`)
            .send({ est_nome: 'teste do patch' })
            .expect(200, done);
    });


    it('Testa a atualização parcial de um recurso inexistente no banco', (done) => {
        request.patch(`/resources/${idInexistente}`)
            .expect(res => {
                assert.equal(res.body.status, `Resource com id: ${idInexistente} não existe`);
            })
            .expect(404, done);
    });


    it('Testa a exclusão de um recurso específico', (done) => {
        request.delete(`/resources/${estabelecimentoPadrao._id}`)
            .expect(200, done);
    });


});