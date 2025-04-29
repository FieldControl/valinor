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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const typeorm_1 = require("typeorm");
const columns_entity_1 = require("../../columns/entities/columns.entity");
let Card = class Card {
    id;
    nome;
    descricao;
    colunaId;
    coluna;
};
exports.Card = Card;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Card.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Card.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Card.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Card.prototype, "colunaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => columns_entity_1.Column, coluna => coluna.cards, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'colunaId' }),
    __metadata("design:type", columns_entity_1.Column)
], Card.prototype, "coluna", void 0);
exports.Card = Card = __decorate([
    (0, typeorm_1.Entity)('tb_card')
], Card);
//# sourceMappingURL=card.entity.js.map