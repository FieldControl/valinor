import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

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

  async update(id: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return this.prisma.card.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
        ...(dto.columnId !== undefined && { columnId: dto.columnId }),
      },
    });
  }

  async remove(id: string) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return this.prisma.card.delete({
      where: { id },
    });
  }

  findByColumn(columnId: string) {
    return this.prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' }
    });
  }
}
