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
exports.KanbanController = void 0;
const common_1 = require("@nestjs/common");
const kanban_service_1 = require("./kanban.service");
let KanbanController = class KanbanController {
    constructor(kanbanService) {
        this.kanbanService = kanbanService;
    }
    async createBoard(title) {
        return this.kanbanService.createBoard(title);
    }
    async getBoards() {
        return this.kanbanService.getBoards();
    }
    async getBoard(id) {
        return this.kanbanService.getBoard(id);
    }
    async updateBoard(id, title) {
        return this.kanbanService.updateBoard(id, title);
    }
    async deleteBoard(id) {
        await this.kanbanService.deleteBoard(id);
        return { message: 'Board excluído com sucesso' };
    }
    async getColumnsByBoardId(id) {
        return this.kanbanService.getColumnsByBoardId(id);
    }
    async createColumn(id, title) {
        return this.kanbanService.createColumn(id, title);
    }
    async updateColumn(id, title) {
        return this.kanbanService.updateColumn(id, title);
    }
    async deleteColumn(id) {
        await this.kanbanService.deleteColumn(id);
    }
    async createCard(id, description) {
        return this.kanbanService.createCard(id, description);
    }
    async getCardById(id) {
        return this.kanbanService.getCardById(id);
    }
    async updateCard(id, isCompleted) {
        return this.kanbanService.updateCard(id, isCompleted);
    }
    async deleteCard(id) {
        await this.kanbanService.deleteCard(id);
    }
};
exports.KanbanController = KanbanController;
__decorate([
    (0, common_1.Post)('boards'),
    __param(0, (0, common_1.Body)('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "createBoard", null);
__decorate([
    (0, common_1.Get)('boards'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "getBoards", null);
__decorate([
    (0, common_1.Get)('boards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "getBoard", null);
__decorate([
    (0, common_1.Put)('boards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "updateBoard", null);
__decorate([
    (0, common_1.Delete)('boards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "deleteBoard", null);
__decorate([
    (0, common_1.Get)('boards/:id/columns'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "getColumnsByBoardId", null);
__decorate([
    (0, common_1.Post)('boards/:id/columns'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "createColumn", null);
__decorate([
    (0, common_1.Put)('columns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "updateColumn", null);
__decorate([
    (0, common_1.Delete)('columns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "deleteColumn", null);
__decorate([
    (0, common_1.Post)('columns/:id/cards'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "createCard", null);
__decorate([
    (0, common_1.Get)('cards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "getCardById", null);
__decorate([
    (0, common_1.Put)('cards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isCompleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "updateCard", null);
__decorate([
    (0, common_1.Delete)('cards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KanbanController.prototype, "deleteCard", null);
exports.KanbanController = KanbanController = __decorate([
    (0, common_1.Controller)('kanban'),
    __metadata("design:paramtypes", [kanban_service_1.KanbanService])
], KanbanController);
//# sourceMappingURL=kanban.controller.js.map