const AutomovelRepository = require("../infra/AutomovelRepository")();
const env = require("../environment");

module.exports = function (app) {

    app.get("/automoveis", (req, res) => {

        /* assumindo valores default em caso de nao serem informados*/
        const page = {
            limit: req.query.limit || 12,
            page: req.query.page || 1,
        }

        const filter = {
            placa: req.query.placa,
            ano: req.query.ano,
            cor: req.query.cor,
            marca: req.query.marca,
            modelo: req.query.modelo,
        }

        const repo = new AutomovelRepository();
        repo.list(page, filter)
            .then(result => {
                res.json(result);
            }).then(() => {
                //repo.close();
            }).catch(err => {
                console.error(err);
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

            }).then(() => {
                repo.close();
            }).catch(err => {
                console.err("Erro inesperado: " + err);
            });
    });

    // ok
    app.post("/automoveis", (req, res) => {
        const automovel = req.body;

        const repo = new AutomovelRepository();
        repo.add(automovel)
            .then(result => {
                res.header("location", `${env.appUrl}/automoveis/${result.insertId}`);
                res.sendStatus(202);
            }).then(() => {
                repo.close();
            }).catch(err => {
                console.err("Erro inesperado: " + err);
            });
    });

    app.delete("/automoveis/:id", (req, res) => {
        const id = req.params.id;
        const repo = new AutomovelRepository();
        repo.remove(id)
            .then(() => {
                res.send();
            }).then(() => {
                repo.close();
            }).catch(err => {
                console.err("Erro inesperado: " + err);
            });
    });

    /*
    | PUT    | /resources/:id | Altera um recurso existente                | 
    */
    app.put("/automoveis/:id", (req, res) => {
        const id = req.params.id;
        const automovel = req.body;

        const repo = new AutomovelRepository();

        repo.update(id, automovel).then(data => {
            console.log(data);

            return data;
        }).then((result) => {
            if (result.affectedRows == 1) {
                res.sendStatus(202); //accepted
            } else {
                throw new Error("Erro " + result.message)
            }
        }).then(() => {
            repo.close();
        }).catch(err => {
            console.error("Erro inesperado: " + err);
        });

    });

    return app;
};