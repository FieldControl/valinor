"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var mongoose_1 = __importDefault(require("mongoose"));
var CarroSchema = new mongoose_1.default.Schema({
    Marca: { type: String },
    Modelo: { type: String },
    Cor: { type: String },
    AnoFabricacao: { type: Date },
    AnoModelo: { type: Date },
    QtdPortas: { type: Number }
});
var Carro = mongoose_1.default.model('Carro', CarroSchema, 'Carro');
module.exports = Carro;
//# sourceMappingURL=Carro.js.map