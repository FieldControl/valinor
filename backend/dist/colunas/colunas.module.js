"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColunasModule = void 0;
const common_1 = require("@nestjs/common");
const colunas_service_1 = require("./colunas.service");
const colunas_controller_1 = require("./colunas.controller");
const typeorm_1 = require("@nestjs/typeorm");
const coluna_entity_1 = require("./entities/coluna.entity");
let ColunasModule = class ColunasModule {
};
exports.ColunasModule = ColunasModule;
exports.ColunasModule = ColunasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([coluna_entity_1.Coluna])],
        controllers: [colunas_controller_1.ColunasController],
        providers: [colunas_service_1.ColunasService],
    })
], ColunasModule);
//# sourceMappingURL=colunas.module.js.map