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
exports.Swimlane = void 0;
const board_entity_1 = require("../../board/entities/board.entity");
const card_entity_1 = require("../../card/entities/card.entity");
const typeorm_1 = require("typeorm");
let Swimlane = class Swimlane {
};
exports.Swimlane = Swimlane;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Swimlane.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Swimlane.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Swimlane.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Swimlane.prototype, "boardId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => board_entity_1.Board, (board) => board.swimlanes),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", board_entity_1.Board)
], Swimlane.prototype, "board", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => card_entity_1.Card, (card) => card.swimlane),
    __metadata("design:type", Array)
], Swimlane.prototype, "cards", void 0);
exports.Swimlane = Swimlane = __decorate([
    (0, typeorm_1.Entity)()
], Swimlane);
//# sourceMappingURL=swimlane.entity.js.map