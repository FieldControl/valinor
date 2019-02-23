const AutomovelRepository = require("../infra/AutomovelRepository")();
const env = require("../environment");

module.exports = function (app) {

    app.get("/automoveis", (req, res) => {

        /* assumindo valores default em caso de nao serem informados*/
        const page = {
            limit: req.query.limit || 12,
            page: req.query.page || 1,
        };

        if (page.limit <= 0) {
            page.limit = 12;
        }

        if (page.page <= 0) {
            page.page = 1;
        }


        const filter = {
            placa: req.query.placa,
            ano: req.query.ano,
            cor: req.query.cor,
            marca: req.query.marca,
            modelo: req.query.modelo,
        };

        const repo = new AutomovelRepository();
        repo.list(page, filter)
            .then(result => {
                res.json(result);
            })
            .then(() => {
                repo.close();
            })
            .catch(err => {
                res.send(500, JSON.stringify(err))
            });
    });

    // ok  tratar os erros
    app.get("/automoveis/:id", (req, res) => {
        const id = req.params.id;

        const repo = new AutomovelRepository();
        repo.findById(id)
            .then(result => {
                const automovel = result[0];
                if (automovel) {
                    res.json(automovel);
                } else {
                    res.sendStatus(204); // no content
                }
            })
            .then(() => {
                repo.close();
            })
            .catch(err => {
                res.send(500, JSON.stringify(err))
            });
    });

    // ok
    app.post("/automoveis", (req, res) => {
        const automovel = req.body;

        const repo = new AutomovelRepository();
        repo.add(automovel)
            .then(result => {
                res.header("location", `${env.app.url}/automoveis/${result.insertId}`);
                res.sendStatus(202);
            })
            .then(() => {
                repo.close();
            })
            .catch(err => {
                res.send(500, JSON.stringify(err))
            });
    });

    app.delete("/automoveis/:id", (req, res) => {
        const id = req.params.id;
        const repo = new AutomovelRepository();
        repo.remove(id)
            .then((data) => {
                console.log(data);
                if (data.affectedRows === 1) {
                    res.send(200);
                } else {
                    res.send(404);
                }
            })
            .then(() => {
                repo.close();
            })
            .catch(err => {
                res.send(500, JSON.stringify(err))
            });
    });

    app.put("/automoveis/:id", (req, res) => {
        const id = req.params.id;


        const automovel = {
            placa: req.body.placa,
            ano: req.body.ano,
            cor: req.body.cor,
            marca: req.body.marca,
            modelo: req.body.modelo
        };

        const repo = new AutomovelRepository();

        repo.update(id, true, automovel).then(data => {
            console.log(data);

            return data;
        }).then((result) => {
            if (result.affectedRows === 1) {
                res.sendStatus(202); //accepted
            } else {
                res.send(500, JSON.stringify(err))
            }
        }).then(() => {
            repo.close();
        }).catch(err => {
            res.send(500, JSON.stringify(err))
        });

    });

    app.patch("/automoveis/:id", (req, res) => {
        const id = req.params.id;
        const automovel = req.body;

        const repo = new AutomovelRepository();

        repo.update(id, false, automovel).then(data => {
            console.log(data);

            return data;
        }).then((result) => {
            if (result.affectedRows === 1) {
                res.sendStatus(202); //accepted
            } else {
                res.send(500, JSON.stringify(err))
            }
        }).then(() => {
            repo.close();
        }).catch(err => {
            res.send(500, JSON.stringify(err))
        });

    });

    return app;
};