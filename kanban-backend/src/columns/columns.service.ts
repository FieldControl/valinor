import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  create(boardId: number, title: string, order: number) {
    return this.prisma.column.create({
      data: {
        title,
        boardId,
        order,
      },
    });
  }

  findAll(boardId: number) {
    return this.prisma.column.findMany({
      where: { boardId },
      include: { tasks: true },
    });
  }

  findOne(id: number) {
    return this.prisma.column.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  delete(id: number) {
    return this.prisma.column.delete({ where: { id } });
  }
}
