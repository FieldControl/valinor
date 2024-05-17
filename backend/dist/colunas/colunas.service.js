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
exports.ColunasService = void 0;
const common_1 = require("@nestjs/common");
const coluna_entity_1 = require("./entities/coluna.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let ColunasService = class ColunasService {
    constructor(colunasRepository) {
        this.colunasRepository = colunasRepository;
    }
    async create(CreateColunaDto) {
        const coluna = this.colunasRepository.create(CreateColunaDto);
        return await this.colunasRepository.save(coluna);
    }
    async findAll() {
        if (!await this.colunasRepository.find())
            throw new common_1.NotFoundException('Nenhuma coluna encontrada.');
        return await this.colunasRepository.find();
    }
    async findOne(id) {
        if (!await this.colunasRepository.findOneBy({ id }))
            throw new common_1.NotFoundException(`Coluna id:${id} não encontrada`);
        return await this.colunasRepository.findOneBy({ id });
    }
    async update(id, updateColunaDto) {
        const coluna = await this.colunasRepository.findOneBy({ id });
        if (!coluna) {
            throw new common_1.NotFoundException(`Coluna id:${id} não encontrada.`);
        }
        coluna.title = updateColunaDto.title;
        return await this.colunasRepository.save(coluna);
    }
    async remove(id) {
        const coluna = await this.findOne(id);
        await this.colunasRepository.remove(coluna);
        return { message: `Coluna id:${id} removida com sucesso.` };
    }
};
exports.ColunasService = ColunasService;
exports.ColunasService = ColunasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(coluna_entity_1.Coluna)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], ColunasService);
//# sourceMappingURL=colunas.service.js.map