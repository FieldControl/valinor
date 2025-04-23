import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(columnId: number, title: string, order: number, description?: string) {
    return this.prisma.task.create({
      data: {
        title,
        description,
        order,
        columnId,
      },
    });
  }

  findAll(columnId: number) {
    return this.prisma.task.findMany({
      where: { columnId },
    });
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  delete(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
