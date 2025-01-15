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
exports.KanbanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let KanbanService = class KanbanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBoard(title) {
        return this.prisma.board.create({
            data: {
                title,
            },
        });
    }
    async getBoards() {
        return this.prisma.board.findMany();
    }
    async getBoard(id) {
        return this.prisma.board.findUnique({
            where: { id },
        });
    }
    async updateBoard(id, title) {
        return this.prisma.board.update({
            where: { id },
            data: { title },
        });
    }
    async deleteBoard(id) {
        try {
            await this.prisma.$transaction(async (prisma) => {
                await prisma.card.deleteMany({
                    where: {
                        column: {
                            boardId: id,
                        },
                    },
                });
                await prisma.column.deleteMany({
                    where: {
                        boardId: id,
                    },
                });
                await prisma.board.delete({
                    where: { id },
                });
            });
        }
        catch (error) {
            console.error('Erro ao excluir board:', error);
            throw error;
        }
    }
    async getColumnsByBoardId(boardId) {
        return this.prisma.column.findMany({
            where: { boardId },
            include: {
                cards: true,
            },
        });
    }
    async createColumn(boardId, title) {
        return this.prisma.column.create({
            data: {
                title,
                boardId,
            },
        });
    }
    async updateColumn(columnId, title) {
        return this.prisma.column.update({
            where: { id: columnId },
            data: { title },
        });
    }
    async deleteColumn(columnId) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.card.deleteMany({
                where: { columnId },
            });
            await prisma.column.delete({
                where: { id: columnId },
            });
        });
    }
    async createCard(columnId, description) {
        return this.prisma.card.create({
            data: {
                description,
                columnId,
            },
        });
    }
    async getCardById(cardId) {
        return this.prisma.card.findUnique({
            where: { id: cardId },
        });
    }
    async updateCard(cardId, isCompleted) {
        return this.prisma.card.update({
            where: { id: cardId },
            data: { isCompleted },
        });
    }
    async deleteCard(cardId) {
        return this.prisma.card.delete({
            where: { id: cardId },
        });
    }
};
exports.KanbanService = KanbanService;
exports.KanbanService = KanbanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KanbanService);
//# sourceMappingURL=kanban.service.js.map