module.exports = function (app) {
    app.get("/resources", function(req, res){
        let db = new app.dao.resourcedao()
        var page = req.query.page
        var search =  req.query.nome
       if (page == undefined && search == undefined){
           db.recuperarTudo().then(function (r) {
            res.json(r)
        }).catch(function (err) {
            res.status(417).json(err);
        })
       }else if(page != undefined &&  search == undefined){
            db.allLimite(page).then(function (r) {
            res.json(r)
            })
       }else if(page != undefined &&  search != undefined){
            db.limiteBusca(page,search).then(function (r) {
                if(r.length >= 1){
                    res.json(r)
                }else{
                    res.status(404).json({error: "Recurso não encontrado"})
                }
            })  
        }else{
            db.busca(search).then(function(r){
                if(r.length >= 1){
                    res.json(r)
                }else{
                    res.status(404).json({error: "Recurso não encontrado"})
                }
            })
        }

        

    })
    
    app.get("/resources/:id", function(req, res){
        let db = new app.dao.resourcedao()
        db.recuperaPorId(req.params.id).then(function (r) {
            if(r != null) {
                res.json(r);
            } else {
                res.status(404).json({error: "Recurso não encontrado"})
            }
        });
    })
    
    app.post('/resources', function (req, res) {
        let db = new app.dao.resourcedao()
        db.adicionarRecurso(req.body).then(function(r) {
            res.send({dados: r, msg: 'Recurso inserido com sucesso!'})
        }).catch(function (err) {
            res.status(417).json(err);
        })    
    })
    
    app.put("/resources/:id", function(req, res){
        let db = new app.dao.resourcedao()
        db.alteraDados(req.params.id, req.body).then(function (r) {
            if(r == 1){
                res.json({recurso: 'Recurso alterado com sucessso'})
            }else{
                res.status(404).json({error: "Recurso não encontrado"})
            }

        }).catch(function (err) {
            res.status(417).json(err);
        })    
    })
    
    app.patch("/resources/:id", function(req, res){
        let db = new app.dao.resourcedao()
        db.alteraDados(req.params.id, req.body).then(function (r) {
            if(r == 1){
                res.json({recurso: 'Recurso alterado com sucessso'})
            }else{
                res.status(404).json({error: "Recurso não encontrado"})
            }
        }).catch(function (err) {
            res.status(417).json(err);
        }) 
    })
    
    app.delete("/resources/:id", function(req, res){
       let db = new app.dao.resourcedao()
        db.excluirDado(req.params.id).then(function (r) {
            if(r == 1) {
                res.send("Recurso excluído com sucesso!");
            } else {
                res.status(404).json({error: "Recurso não encontrado"})
            }
        })   
    })    
}