"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app_1 = require("../db/app");
var router = express_1.Router();
/*
   Exemplo

   post: /Carro

   body:
    {
    "Marca": "FORD",
    "Modelo": "FOCUS",
    "Cor": "VERMELHO",
    "AnoFabricacao":  "2014-01-23T18:25:43.511Z",
    "AnoModelo":  "2014-01-01T18:25:43.511Z",
    "QtdPortas": 4
    }
    
 */
router.post('/', function (req, res) {
    try {
        console.log('Add Carro');
        var app = new app_1.App();
        app.AddCarro(req.body).then(function (result) {
            console.log('OK: Add Carro');
            res.status(200);
            res.send('OK : Add Carro');
        }, function (error) {
            console.log('function /carro');
            res.status(500);
            res.send('Não foi possível Inserir Carro: ' + error);
        });
    }
    catch (error) {
        console.log('catch');
        res.status(500);
        res.send('Não foi possível Inserir Carro: ' + error);
    }
});
/*
   Exemplo
   
   get: /Carro

   body:
    {
        "limit":100,
        "skip":1,
        "car":{
            "Marca": "FORD"
    }
}
    
 */
router.get('/', function (req, res) {
    try {
        console.log('get Carro');
        var app = new app_1.App();
        app.getListCarro(req.body.skip, req.body.limit, req.body.car).then(function (result) {
            console.log('OK: get Carro');
            res.status(200);
            res.send(result);
        }, function (error) {
            console.log('function /get ');
            res.status(500);
            res.send('Não foi recuperar carros: ' + error);
        });
    }
    catch (error) {
        console.log('catch');
        res.status(500);
        res.send('Não foi possível recuperar carros: ' + error);
    }
});
/*
   Exemplo
   
   get: /Carro/5cb105f4dcc5f62ec0de6dbf

}
    
 */
router.get('/:id', function (req, res) {
    try {
        console.log('get id Carro');
        var app = new app_1.App();
        app.getCarro(req.params.id).then(function (result) {
            console.log('OK: get id Carro');
            res.status(200);
            res.send(result);
        }, function (error) {
            console.log('function /get id');
            res.status(500);
            res.send('Não foi recuperar carro: ' + error);
        });
    }
    catch (error) {
        console.log('catch');
        res.status(500);
        res.send('Não foi possível recuperar carro: ' + error);
    }
});
/*
   Exemplo
   
   put: /Carro/5cb105f4dcc5f62ec0de6dbf

   body:
    {
        "Marca": "FORD",
        "Modelo": "FOCUS",
        "Cor": "VERMELHO",
        "AnoFabricacao": "2014-01-23T18:25:43.511Z",
        "AnoModelo": "2014-01-01T18:25:43.511Z",
        "QtdPortas": 4
    }
    
 */
router.put('/:id', function (req, res) {
    try {
        console.log('put id Carro');
        var app = new app_1.App();
        app.putCarro(req.params.id, req.body).then(function (result) {
            console.log('OK: put id Carro');
            res.status(200);
            res.send(result);
        }, function (error) {
            console.log('function /put id');
            res.status(500);
            res.send('Não foi alterar carro: ' + error);
        });
    }
    catch (error) {
        console.log('catch');
        res.status(500);
        res.send('Não foi possível alterar carro: ' + error);
    }
});
/*
   Exemplo
   
   patch: /Carro/5cb105b5dcc5f62ec0de6dbe

   body:
        {
            "Cor": "BRANCO"
        }
    
 */
router.patch('/:id', function (req, res) {
    try {
        console.log('patch id Carro');
        var app = new app_1.App();
        app.patchCarro(req.params.id, req.body).then(function (result) {
            console.log('OK: patch id Carro');
            res.status(200);
            res.send(result);
        }, function (error) {
            console.log('function /patch id');
            res.status(500);
            res.send('Não foi alterar carro: ' + error);
        });
    }
    catch (error) {
        console.log('catch');
        res.status(500);
        res.send('Não foi possível alterar carro: ' + error);
    }
});
/*
   Exemplo
   
   delete: /Carro/5cb10f90d808c91b6c4d2b8b
    
 */
router.delete('/:id', function (req, res) {
    try {
        console.log('delete id Carro');
        var app = new app_1.App();
        app.deleteCarro(req.params.id).then(function (result) {
            console.log('OK: delete id Carro');
            res.status(200);
            res.send(result);
        }, function (error) {
            console.log('function /delete id');
            res.status(500);
            res.send('Não foi alterar carro: ' + error);
        });
    }
    catch (error) {
        console.log('catch');
        res.status(500);
        res.send('Não foi possível alterar carro: ' + error);
    }
});
exports.CarroController = router;
//# sourceMappingURL=carro.controller.js.map