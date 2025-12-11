import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(columnId: string, dto: CreateCardDto) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException('Coluna não Encontrada!')
    }

    let order = dto.order;
    if (order == undefined || order == null) {
      const max = await this.prisma.card.aggregate({
        where: { columnId },
        _max: { order: true }
      });
      order = (max._max.order ?? -1) + 1;
    }

    const card = await this.prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description,
        order,
        columnId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null
      }
    });

    return card;
  }

  findByColumn(columnId: string) {
    return this.prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' } 
    });
  }
}
