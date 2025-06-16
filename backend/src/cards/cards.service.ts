import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card-with-tasks.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

    async createCardForMember(leaderId: number, dto: CreateCardDto) {
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
}
