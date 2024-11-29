import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from './dtos/task.model';
import { CreateTask } from './dtos/task-create.input';
import { UpdateTask } from './dtos/task-update.input';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) { }

  async tasks(): Promise<Task[]> {
    return await this.prismaService.task.findMany({
      include: {
        column: true,
      }
    })
  }

  async crate(body: CreateTask): Promise<Task> {
    return await this.prismaService.task.create({
      data: body,
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
