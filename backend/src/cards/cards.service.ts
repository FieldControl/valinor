import { Injectable, NotFoundException } from '@nestjs/common';
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

}
