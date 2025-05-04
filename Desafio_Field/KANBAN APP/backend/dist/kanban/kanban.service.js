"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanService = void 0;
// backend/src/kanban/kanban.service.ts
const common_1 = require("@nestjs/common");
let KanbanService = class KanbanService {
    constructor() {
        this.columns = [
            { id: 1, title: 'To Do', cards: [] },
            { id: 2, title: 'In Progress', cards: [] }
        ];
    }
    getColumns() {
        return this.columns;
    }
    createCard(content, columnId) {
        const card = { id: Date.now(), content, column: columnId };
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            column.cards.push(card);
        }
        return card;
    }
};
KanbanService = __decorate([
    (0, common_1.Injectable)()
], KanbanService);
exports.KanbanService = KanbanService;
