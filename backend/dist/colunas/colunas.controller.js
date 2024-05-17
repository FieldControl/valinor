"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColunasController = void 0;
const common_1 = require("@nestjs/common");
const colunas_service_1 = require("./colunas.service");
const create_coluna_dto_1 = require("./dto/create-coluna.dto");
const update_coluna_dto_1 = require("./dto/update-coluna.dto");
let ColunasController = class ColunasController {
    constructor(colunasService) {
        this.colunasService = colunasService;
    }
    create(createColunaDto) {
        return this.colunasService.create(createColunaDto);
    }
    findAll() {
        return this.colunasService.findAll();
    }
    findOne(id) {
        return this.colunasService.findOne(+id);
    }
    update(id, updateColunaDto) {
        return this.colunasService.update(+id, updateColunaDto);
    }
    remove(id) {
        return this.colunasService.remove(+id);
    }
};
exports.ColunasController = ColunasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coluna_dto_1.CreateColunaDto]),
    __metadata("design:returntype", void 0)
], ColunasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ColunasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColunasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_coluna_dto_1.UpdateColunaDto]),
    __metadata("design:returntype", void 0)
], ColunasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColunasController.prototype, "remove", null);
exports.ColunasController = ColunasController = __decorate([
    (0, common_1.Controller)('colunas'),
    __metadata("design:paramtypes", [colunas_service_1.ColunasService])
], ColunasController);
//# sourceMappingURL=colunas.controller.js.map