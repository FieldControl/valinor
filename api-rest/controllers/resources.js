var _ = require('lodash');

module.exports = function(app) {   

    app.get('/resources', (req, res) => {
        let service = new app.services.ResourceService(app);

        service.listaTodos(req.query, (erro, resultado) => {
            if(erro){
                res.status(400).send({status:"ERROR", erros: erro});
            } else {
                res.status(200).json(resultado);
            }
        });
        
    });

    app.get('/resources/:id', (req, res) => {
        let service = new app.services.ResourceService(app);

        service.buscaPorId(req.params, (erro, resultado) => {
            if(erro){
                res.status(400).send({status:"ERROR", erros: erro});
            } else {
                _.isEmpty(resultado) ? res.status(404).json({erro:"Não existe resource"}) : res.status(200).json(resultado);
            }
        });
    });

    /**
     *  PUT	/resources/:id	Altera um recurso existente
     *  --> "PUT is considered idempotent", toda entidade
     *  REFERÊNCIA: #RFC2616 
     *              https://tools.ietf.org/html/rfc2616#page-55
     */
    app.put('/resources/:id', (req, res, next) => {
        let service = new app.services.ResourceService(app);

        let erros = service.validar(req);
        if(erros) {
            res.status(400).send({status: "ERRO NA VALIDAÇÃO", erros: erros});
            next(erros);
        }

        resource = service.atualiza(req, (erro) => {
            if(erro){
                res.status(500).json({status:"ERROR", erro: erro.sqlMessage});
                next(erros);
            } else {
                res.status(200).json({status: "FOI ATUALIZADO", data: resource});
            }
        });        

    });

    app.patch('/resources/:id', (req, res) => {
        let service = new app.services.ResourceService(app);

        resource = service.atualiza(req, (erro) => {
            if(erro){
                res.status(500).json({status:"ERROR", erro: erro.sqlMessage});
                next(erros);
            } else {
                res.status(200).json({status: "FOI ATUALIZADO", data: resource});
            }
        });        

    });

    app.post('/resources', (req, res) => {
        let service = new app.services.ResourceService(app);

        let erros = service.validar(req);
        if(erros) {
            res.status(400).send({status: "ERRO NA VALIDAÇÃO", erros: erros});
            next(erros);
        }

        let resource = service.salva(req, (erro, resultado) => {
            if(erro){
                res.status(500).send({status:"ERROR", erro: erro.sqlMessage});
                next(erros);
            } else {
                resource.id = resultado.insertId;
                res.status(201).json({status: "FOI CRIADO", data: resource});
            }
        });

    });

    app.delete('/resources/:id', (req, res) => {
        let service = new app.services.ResourceService(app);

        resource = service.excluir(req, (erro) => {
            if(erro){
                res.status(500).json(erro);
                next(erros);
            } else {
                res.status(204).json({status: "FOI DELETADO", data: resource});
            }
        })

    });

}