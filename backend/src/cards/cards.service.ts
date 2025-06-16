import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card-with-tasks.dto';
import { Card} from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

    async createCardForMember(leaderId: number, dto: CreateCardDto) {
        const member = await this.prisma.user.findUnique({
            where: { id: dto.memberId },
        });

        if (!member) {
            throw new NotFoundException(`Usuário com ID ${dto.memberId} não existe`);
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

    async findCardsByMemberId(memberId: number): Promise<Card[]> {
        return this.prisma.card.findMany({
            where: { memberId },
            include: {
                tasks: true,
            },
        });
    }

    async submitCard(cardId: number, userId: number) {
        const card = await this.prisma.card.findUnique({
            where: { id: cardId },
            include: { tasks: true },
        });

        if (!card) throw new NotFoundException('Card nao encontrado meu camarada');

        if (card.memberId !== userId) {
            throw new ForbiddenException('Esse card nao é teu rapais');
        }

        const allDone = card.tasks.every(task => task.status === 'DONE');
        if (!allDone) {
            throw new BadRequestException('Todas as tasks tem que estar marcadas, espertin...');
        }

        return this.prisma.card.update({
            where: { id: cardId },
            data: { sentByMember: true },
        });
    }

    async findSubmittedCardsByLeader(leaderId: number) {
        return this.prisma.card.findMany({
            where: {
                leaderId,
                sentByMember: true,
            },
            include: {
                tasks: true,
                member: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

    async deleteSubmittedCardByLeader(cardId: number, leaderId: number) {
        const card = await this.prisma.card.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            throw new NotFoundException('Card não encontrado');
        }

        if (card.leaderId !== leaderId) {
            throw new ForbiddenException('Você não tem permissão para deletar este card');
        }

        if (!card.sentByMember) {
            throw new BadRequestException('Este card ainda não foi enviado pelo membro');
        }

        // Exclui tasks vinculadas antes, por integridade referencial
        await this.prisma.task.deleteMany({ where: { cardId } });

        // Agora deleta o card
        return this.prisma.card.delete({ where: { id: cardId } });
    }

}
