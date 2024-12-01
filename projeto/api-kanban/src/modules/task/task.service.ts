import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from './dtos/task.model';
import { CreateTask } from './dtos/task-create.input';
import { UpdateTask } from './dtos/task-update.input';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) { }

  async lastTask(id_column: number): Promise<Task | null> {
    return await this.prismaService.task.findFirst({
      where: {
        id_column
      },
      orderBy: {
        sequence: 'desc',
      },
    })
  }

  async tasks(): Promise<Task[]> {
    return await this.prismaService.task.findMany({
      include: {
        column: true,
      }
    })
  }

  async create(body: CreateTask): Promise<Task> {
    const task = await this.lastTask(body.id_column)

    return await this.prismaService.task.create({
      data: {
        ...body,
        sequence: task?.id ? task.sequence + 1 : 1
      },
    })
  }

  async update(body: UpdateTask): Promise<Task> {
    const { id, ...updatedFields } = body

    return await this.prismaService.task.update({
      where: { id },
      data: updatedFields,
    })
  }

  async delete(id: number): Promise<{ id: number }> {
    await this.prismaService.task.update({
      where: { id },
      data: {
        deleted: true,
      },
    })

    return { id }
  }
}
