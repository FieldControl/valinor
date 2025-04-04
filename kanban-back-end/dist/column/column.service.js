"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let ColumnService = class ColumnService {
    columns = [];
    getAll() {
        return this.columns;
    }
    create(title) {
        const newColumn = {
            id: (0, uuid_1.v4)(),
            title,
            cards: [],
        };
        this.columns.push(newColumn);
        return newColumn;
    }
    getById(id) {
        return this.columns.find(col => col.id === id);
    }
    addCardToColumn(columnId, card) {
        const column = this.getById(columnId);
        if (column) {
            column.cards = column.cards ?? [];
            column.cards.push(card);
        }
    }
};
exports.ColumnService = ColumnService;
exports.ColumnService = ColumnService = __decorate([
    (0, common_1.Injectable)()
], ColumnService);
//# sourceMappingURL=column.service.js.map