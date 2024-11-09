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
const typeorm_1 = require("@nestjs/typeorm");
const card_entity_1 = require("./entities/card.entity");
const typeorm_2 = require("typeorm");
const swimlane_service_1 = require("../swimlane/swimlane.service");
const user_service_1 = require("../user/user.service");
let CardService = class CardService {
    constructor(cardRepository, swimlaneService, userService) {
        this.cardRepository = cardRepository;
        this.swimlaneService = swimlaneService;
        this.userService = userService;
    }
    async create(createCardDto, userId) {
        const card = new card_entity_1.Card();
        card.name = createCardDto.name;
        card.content = createCardDto.content;
        card.swimlaneId = createCardDto.swimlaneId;
        card.order = createCardDto.order;
        const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane(createCardDto.swimlaneId, userId);
        if (!hasAccessToSwimlane) {
            throw new common_1.UnauthorizedException('You are not a part of this board.');
        }
        return this.cardRepository.save(card);
    }
    async updateCardOrdersAndSwimlanes(reorder, userId) {
        await this.userService.isConnectedToBoard(userId, reorder.boardId);
        const promises = reorder.cards.map((card) => this.cardRepository.update(card.id, {
            order: card.order,
            swimlaneId: card.swimlaneId,
        }));
        await Promise.all(promises);
        return true;
    }
    async update(id, userId, updateCardDto) {
        await this.userService.isConnectedToSwimlane(userId, updateCardDto.swimlaneId);
        return this.cardRepository.update(id, {
            name: updateCardDto.name,
            content: updateCardDto.content,
        });
    }
    async remove(id, userId) {
        const card = await this.cardRepository.findOneBy({ id });
        await this.userService.isConnectedToSwimlane(userId, card.swimlaneId);
        return this.cardRepository.delete(id);
    }
};
exports.CardService = CardService;
exports.CardService = CardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        swimlane_service_1.SwimlaneService,
        user_service_1.UserService])
], CardService);
//# sourceMappingURL=card.service.js.map