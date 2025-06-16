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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CardsService = class CardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCardForMember(leaderId, dto) {
        const member = await this.prisma.user.findUnique({
            where: { id: dto.memberId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Usuário com ID ${dto.memberId} não existe`);
        }
        return this.prisma.card.create({
            data: {
                title: dto.title,
                leaderId,
                memberId: dto.memberId,
                tasks: {
                    create: dto.tasks.map(task => ({
                        description: task.description,
                        assignedToId: dto.memberId,
                    })),
                },
            },
            include: {
                tasks: true,
            },
        });
    }
    async findCardsByMemberId(memberId) {
        return this.prisma.card.findMany({
            where: { memberId },
            include: {
                tasks: true,
            },
        });
    }
    async submitCard(cardId, userId) {
        const card = await this.prisma.card.findUnique({
            where: { id: cardId },
            include: { tasks: true },
        });
        if (!card)
            throw new common_1.NotFoundException('Card nao encontrado meu camarada');
        if (card.memberId !== userId) {
            throw new common_1.ForbiddenException('Esse card nao é teu rapais');
        }
        const allDone = card.tasks.every(task => task.status === 'DONE');
        if (!allDone) {
            throw new common_1.BadRequestException('Todas as tasks tem que estar marcadas, espertin...');
        }
        return this.prisma.card.update({
            where: { id: cardId },
            data: { sentByMember: true },
        });
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CardsService);
//# sourceMappingURL=cards.service.js.map