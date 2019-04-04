let Personagem = require('../../api/v1/personagens/model/personagemModel');

describe("Rotas: Personagens", () => {
    let goku;
    let vegeta;
    let kuririn;

    beforeEach(done => {
        Personagem.deleteMany({}, err => {
            goku = new Personagem();
            goku.nome = "Goku";
            goku.raca = "Sayajin";
            goku.sexo = "Masculino";
            goku.poder = 8000;

            goku.save();

            vegeta = new Personagem();
            vegeta.nome = "Vegeta";
            vegeta.raca = "Sayajin";
            vegeta.sexo = "Masculino";
            vegeta.poder = 7999;

            vegeta.save();

            kuririn = new Personagem();
            kuririn.nome = "Kuririn";
            kuririn.raca = "Humano";
            kuririn.sexo = "Masculino";
            kuririn.poder = 500;

            done(err);
        })
    });
    
    describe("GET /v1/personagens", () => {
        describe("status 200", () => {
            it("retorna a lista de personagens", done => {
                request
                    .get("/v1/personagens")
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body).to.have.length(2);
                        expect(res.body[0].nome).to.eql("Goku");
                        expect(res.body[1].nome).to.eql("Vegeta");
                        done(err);
                    });
            });
        });
    });

    describe("POST /v1/personagens", () => {
        describe("status 201", () => {
            it("cria um novo personagem", done => {
                request
                    .post("/v1/personagens")
                    .send(kuririn)
                    .expect(201)
                    .end((err, res) => {
                        let id = res.headers.location.split("/")[2];
                        Personagem.findById(id, (err, personagem) => {
                            expect(personagem._id.toString()).to.eql(id);
                            expect(personagem.nome).to.eql(kuririn.nome);
                            expect(personagem.raca).to.eql(kuririn.raca);
                            expect(personagem.sexo).to.eql(kuririn.sexo);
                            expect(personagem.poder).to.eql(kuririn.poder);
                            
                            done(err)
                        });
                    });
            });
        });

        describe("status 400", () => {
            it("retorna erro caso seja enviado um personagem inválido", (done) => {
                request
                    .post("/v1/personagens")
                    .send({
                        "nome": "Cell",
                        "poder": 10000
                    })
                    .expect(400)
                    .end((err, res) => done(err));
            })
        })
    });

    describe("GET /v1/personagens/:id", () => {
        describe("status 200", () => {
            it("retorna um personagem", done => {
                request
                    .get(`/v1/personagens/${goku._id}`)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.nome).to.eql("Goku");
                        done(err);
                    });
            });
        });

        describe("status 404", () => {
            it("retorna erro caso personagem não exista", done => {
                request
                    .get("/v1/personagens/000000000000000000000000")
                    .expect(404)
                    .end((err, res) => done(err));
            });
        });
    });

    describe("PUT /v1/personagens/:id", () => {
        describe("status 204", () => {
            it("atualiza um personagem completamente", done => {
                let kakaroto = {
                    "nome": "Kakaroto",
                    "raca": "Sayajin/Humano",
                    "sexo": "M",
                    "poder": 10000
                }

                request
                    .put(`/v1/personagens/${goku._id}`)
                    .send(kakaroto)
                    .expect(204)
                    .end((err, res) => {
                        Personagem.findById(goku._id, (err, personagem) => {
                            expect(personagem.nome).to.eql(kakaroto.nome);
                            expect(personagem.raca).to.eql(kakaroto.raca);
                            expect(personagem.sexo).to.eql(kakaroto.sexo);
                            expect(personagem.poder).to.eql(kakaroto.poder);
                            
                            done(err)
                        });
                    });
            });
        });

        describe("status 400", () => {
            it("retorna erro ao tentar atualiar um personagem parcialmente", done => {
                request
                    .put(`/v1/personagens/${goku._id}`)
                    .send({
                        "nome": "Kakaroto"
                    })
                    .expect(400)
                    .end((err, res) => done(err));
            });
        });

        describe("status 404", () => {
            it("retorna erro ao tentar atualizar um personagem inexistente", done => {
                request
                    .put(`/v1/personagens/000000000000000000000000`)
                    .send(kuririn)
                    .expect(404)
                    .end((err, res) => done(err));
            });
        });
    });

    describe("PATCH /v1/personagens/:id", () => {
        describe("status 204", () => {
            it("atualiza um personagem parcialmente", done => {
                let nome = "Kakaroto"
                request
                    .patch(`/v1/personagens/${goku._id}`)
                    .send({
                        "nome": nome
                    })
                    .expect(204)
                    .end((err, res) => {
                        Personagem.findById(goku._id, (err, personagem) => {
                            expect(personagem.nome).to.eql(nome);
                            expect(personagem.raca).to.eql(goku.raca);
                            expect(personagem.sexo).to.eql(goku.sexo);
                            expect(personagem.poder).to.eql(goku.poder);
                            
                            done(err)
                        });
                    });
            });
        });
        
        describe("status 404", () => {
            it("retorna erro ao tentar atualizar parcialmente um personagem inexistente", done => {
                request
                    .patch(`/v1/personagens/000000000000000000000000`)
                    .send({"nome": "Kakaroto"})
                    .expect(404)
                    .end((err, res) => done(err));
            });
        });
    });

    describe("DELETE /v1/personagens/:id", () => {
        describe("status 204", () => {
            it("remove um personagem", done => {
                request
                    .delete(`/v1/personagens/${goku._id}`)
                    .expect(204)
                    .end((err, res) => {
                        Personagem.findById(goku._id, (err, personagem) => {
                            expect(personagem).to.be.null;
                            done(err)
                        });
                    });
            });
        });
    });
});