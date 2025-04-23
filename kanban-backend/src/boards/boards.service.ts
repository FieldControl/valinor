import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(title: string) {
    return this.prisma.board.create({
      data: {
        title: title,
      },
    });
  }

  findAll() {
    return this.prisma.board.findMany({
      include: { columns: true },
    });
  }

  findOne(id: number) {
    return this.prisma.board.findUnique({
      where: { id },
      include: { columns: { include: { tasks: true } } },
    });
  }

  delete(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }
}
