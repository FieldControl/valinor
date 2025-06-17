import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async updateStatus(taskId: number, userId: number, status: TaskStatus) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId }, include: { card: true } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.assignedToId !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    if (task.card.sentByMember) throw new BadRequestException('Card já enviado, não pode ser editado');

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}
