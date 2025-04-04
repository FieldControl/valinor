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
exports.CardResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const card_model_1 = require("./card.model");
const card_service_1 = require("./card.service");
const column_service_1 = require("../column/column.service");
let CardResolver = class CardResolver {
    cardService;
    columnService;
    constructor(cardService, columnService) {
        this.cardService = cardService;
        this.columnService = columnService;
    }
    createCard(columnId, title, description) {
        const newCard = this.cardService.createCard(title, description);
        this.columnService.addCardToColumn(columnId, newCard);
        return newCard;
    }
};
exports.CardResolver = CardResolver;
__decorate([
    (0, graphql_1.Mutation)(() => card_model_1.Card),
    __param(0, (0, graphql_1.Args)('columnId')),
    __param(1, (0, graphql_1.Args)('title')),
    __param(2, (0, graphql_1.Args)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", card_model_1.Card)
], CardResolver.prototype, "createCard", null);
exports.CardResolver = CardResolver = __decorate([
    (0, graphql_1.Resolver)(() => card_model_1.Card),
    __metadata("design:paramtypes", [card_service_1.CardService,
        column_service_1.ColumnService])
], CardResolver);
//# sourceMappingURL=card.resolver.js.map