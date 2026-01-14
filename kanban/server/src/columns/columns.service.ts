import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';


@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(boardId: string, dto: CreateColumnDto) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Coluna não encontrado!')
    }

    let order = dto.order;
    if (order == undefined || order == null) {
      const max = await this.prisma.column.aggregate({
        where: { boardId },
        _max: { order: true }
      });
      order = (max._max.order ?? -1) + 1;
    }

    return await this.prisma.column.create({
      data: {
        title: dto.title,
        order,
        boardId
      }
    });
  }

  async update(id: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({ where: { id } });
    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    return this.prisma.column.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(id: string) {
    const column = await this.prisma.column.findUnique({ where: { id } });
    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    return this.prisma.column.delete({
      where: { id },
    });
  }

  findByBoard(boardId: string) {
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        cards: { orderBy: { order: 'asc' } }
      }
    });
  }
}
