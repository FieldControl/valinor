let Personagem = require('../model/personagemModel');

exports.index = (req, res) => {
    Personagem.get((err, personagens) => {
        if (err) {
            res.sendStatus(500);
        }else {
            res.status(200).json(personagens);
        }
    });
};

exports.new = (req, res) => {
    var personagem = new Personagem();
    personagem.nome = req.body.nome;
    personagem.raca = req.body.raca;
    personagem.sexo = req.body.sexo;
    personagem.poder = req.body.poder;

    personagem.validate(err => {
        if(err) {
            res.sendStatus(400);
        }else {
            personagem.save(err => {
                if(err) {
                    res.sendStatus(500);
                }else {
                    res.set('Location',`api/personagens/${personagem._id}`).sendStatus(201);
                }
            });
        }
    })
};

exports.view = (req, res) => {
    Personagem.findById(req.params.personagem_id, (err, personagem) => {
        if (err) {
            console.dir(err);
            res.sendStatus(500);
        }else if(personagem) {
            res.status(200).json(personagem);
        }else {
            res.sendStatus(404);
        }
    });
};

exports.update = (req, res) => {
    Personagem.findById(req.params.personagem_id, (err, personagem) => {
        if (err) {
            res.sendStatus(500);
        }else if (personagem) {
            personagem.nome = req.body.nome;
            personagem.raca = req.body.raca;
            personagem.sexo = req.body.sexo;
            personagem.poder = req.body.poder;

            personagem.validate(err => {
                if (err) {
                    res.sendStatus(400);
                }else {
                    personagem.save(err => {
                        if (err) {
                            res.sendStatus(500);
                        }else {
                            res.sendStatus(204);
                        }
                    });
                }
            });
        }else {
            res.sendStatus(404);
        }
    });
};

exports.partialUpdate = (req, res) => {
    Personagem.findById(req.params.personagem_id, (err, personagem) => {
        if (err) {
            res.sendStatus(500);
        }else if(personagem) {
            personagem.nome = req.body.nome || personagem.nome;
            personagem.raca = req.body.raca || personagem.raca;
            personagem.sexo = req.body.sexo || personagem.sexo;
            personagem.poder = req.body.poder || personagem.poder;

            personagem.save(err => {
                if (err) {
                    res.sendStatus(500);
                }else {
                    res.sendStatus(204);
                }
            });
        }else {
            res.sendStatus(404);
        }
    });
}

exports.delete = (req, res) => {
    Personagem.deleteOne({_id: req.params.personagem_id}, (err, personagem) => {
        if (err) {
            res.sendStatus(500);
        }else {
            res.sendStatus(204);
        }
    });
};