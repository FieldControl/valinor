"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var db = require("./Contexto");
var Carro_1 = __importDefault(require("./Modelo/Carro"));
var Functions_1 = require("../genericos/Functions");
var App = /** @class */ (function () {
    function App() {
    }
    App.prototype.AddCarro = function (JsonCarro) {
        return new Promise(function (resolve, reject) {
            db.connectDataBase().then(function () {
                console.log("AddCarro");
                var carroData = JsonCarro;
                if (Functions_1.Functions.isNullOrEmpty(carroData.Marca))
                    return reject('Marca do Carro não informada.');
                if (Functions_1.Functions.isNullOrEmpty(carroData.Modelo))
                    return reject('Modelo do Carro não informado.');
                if (Functions_1.Functions.isNullOrEmpty(carroData.Cor))
                    return reject('Cor do Carro não informado.');
                if (!Functions_1.Functions.isValidDate(carroData.AnoFabricacao))
                    return reject('Ano de Fabricação do Carro não informado.');
                if (!Functions_1.Functions.isValidDate(carroData.AnoModelo))
                    return reject('Ano do Modelo do Carro não informado.');
                if (Functions_1.Functions.isNullOrEmpty(carroData.QtdPortas) || (carroData.QtdPortas <= 0))
                    return reject('Quantidade Portas do Carro não informado.');
                var carro = new Carro_1.default();
                carro.Marca = carroData.Marca;
                carro.Modelo = carroData.Modelo;
                carro.Cor = carroData.Cor;
                carro.AnoFabricacao = carroData.AnoFabricacao;
                carro.AnoModelo = carroData.AnoModelo;
                carro.QtdPortas = carroData.QtdPortas;
                carro.save(function (error, carro) {
                    if (error) {
                        console.error(error);
                        return reject(error);
                    }
                    resolve('OK');
                });
            }).catch(function (err) { return reject("Não foi possível conectar Banco de Dados." + err); });
        });
    };
    App.prototype.getCarro = function (id) {
        return new Promise(function (resolve, reject) {
            db.connectDataBase().then(function () {
                Carro_1.default.findById(id, function (err, carro) {
                    if (err)
                        return reject(err);
                    return resolve(carro == undefined ? {} : carro);
                });
            }).catch(function (err) { return reject("Não foi possível conectar Banco."); });
        });
    };
    App.prototype.getListCarro = function (skip, limit, carro) {
        return new Promise(function (resolve, reject) {
            db.connectDataBase().then(function () {
                Carro_1.default.find((carro), function (err, carros) {
                    if (err)
                        return reject(err);
                    return resolve(carros == undefined ? [] : carros);
                }).skip(skip || 0).limit(limit || 0);
            }).catch(function (err) { return reject("Não foi possível conectar Banco."); });
        });
    };
    App.prototype.putCarro = function (id, carro) {
        return new Promise(function (resolve, reject) {
            db.connectDataBase().then(function () {
                Carro_1.default.findByIdAndUpdate(id, carro, function (err) {
                    if (err)
                        return reject(err);
                    return resolve('Alterado com sucesso');
                });
            }).catch(function (err) { return reject("Não foi possível conectar Banco."); });
        });
    };
    App.prototype.patchCarro = function (id, carro) {
        return new Promise(function (resolve, reject) {
            db.connectDataBase().then(function () {
                Carro_1.default.findByIdAndUpdate(id, carro, function (err) {
                    if (err)
                        return reject(err);
                    return resolve('Alterado com sucesso');
                });
            }).catch(function (err) { return reject("Não foi possível conectar Banco."); });
        });
    };
    App.prototype.deleteCarro = function (id) {
        return new Promise(function (resolve, reject) {
            db.connectDataBase().then(function () {
                Carro_1.default.findByIdAndRemove(id, function (err) {
                    if (err)
                        return reject(err);
                    return resolve('Removido com sucesso');
                });
            }).catch(function (err) { return reject("Não foi possível conectar Banco."); });
        });
    };
    return App;
}());
exports.App = App;
//# sourceMappingURL=app.js.map