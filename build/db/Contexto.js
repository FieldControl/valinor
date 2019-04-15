"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
function connectDataBase() {
    return mongoose_1.default.connect('mongodb://localhost:27017/BancoCarSale', { useNewUrlParser: true });
}
exports.connectDataBase = connectDataBase;
//# sourceMappingURL=Contexto.js.map