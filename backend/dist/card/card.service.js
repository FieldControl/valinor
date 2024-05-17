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
exports.CardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const card_entity_1 = require("./entities/card.entity");
const typeorm_2 = require("@nestjs/typeorm");
let CardService = class CardService {
    constructor(cardRepository) {
        this.cardRepository = cardRepository;
    }
    async create(createCardDto) {
        const card = this.cardRepository.create(createCardDto);
        return await this.cardRepository.save(card);
    }
    async findAll() {
        if (!await this.cardRepository.find())
            throw new common_1.NotFoundException('Nenhum card encontrado.');
        return await this.cardRepository.find();
    }
    async findOne(id) {
        if (!await this.cardRepository.findOneBy({ id }))
            throw new common_1.NotFoundException(`Card id:${id} não encontrada`);
        return await this.cardRepository.findOneBy({ id });
    }
    async update(id, updateCardDto) {
        const card = await this.cardRepository.findOneBy({ id });
        if (!card) {
            throw new common_1.NotFoundException(`Card id:${id} não encontrada.`);
        }
        card.description = updateCardDto.description;
        return await this.cardRepository.save(card);
    }
    async remove(id) {
        const card = await this.findOne(id);
        await this.cardRepository.remove(card);
        return { message: `Card id:${id} removida com sucesso.` };
    }
};
exports.CardService = CardService;
exports.CardService = CardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CardService);
//# sourceMappingURL=card.service.js.map