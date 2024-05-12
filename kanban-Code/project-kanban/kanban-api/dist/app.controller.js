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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./database/prisma.service");
const create_board_1 = require("./dtos/create-board");
let AppController = class AppController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBoard(body) {
        const { name, columns } = body;
        const board = await this.prisma.board.create({
            data: {
                name: name,
                columns: {
                    create: columns.map(column => ({
                        name: column.name,
                        boardId: column.boardId
                    }))
                }
            },
            include: {
                columns: true,
            }
        });
        return {
            board,
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_board_1.CreateBoards]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createBoard", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)("/a"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map