"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnsService = void 0;
const common_1 = require("@nestjs/common");
const columns_model_1 = require("./columns.model");
let ColumnsService = class ColumnsService {
    constructor() {
        this.columns = [
            new columns_model_1.Column('Provados', ['Chocolate', 'Nutella', 'Kinder Ovo']),
            new columns_model_1.Column('Para Experimentar', ['Alfajor', 'Doce de Leite', 'Limão']),
            new columns_model_1.Column('Favoritos', ['Ninho', 'Chocolate Branco', 'Negresco']),
            new columns_model_1.Column('Não gostei', ['Chocomenta', 'Coco', 'Morango']),
        ];
    }
    getColumns() {
        return this.columns;
    }
};
exports.ColumnsService = ColumnsService;
exports.ColumnsService = ColumnsService = __decorate([
    (0, common_1.Injectable)()
], ColumnsService);
//# sourceMappingURL=columns.service.js.map