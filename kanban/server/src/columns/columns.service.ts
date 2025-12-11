import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(boardId: string, dto: CreateColumnDto) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado!')
    }

    let order = dto.order;
    if (order == undefined || order == null) {
      const max = await this.prisma.column.aggregate({
        where: { boardId },
        _max: { order: true }
      });
      order = (max._max.order ?? -1) + 1;
    }

    const card = await this.prisma.column.create({
      data: {
        title: dto.title,
        order,
        boardId
      }
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
