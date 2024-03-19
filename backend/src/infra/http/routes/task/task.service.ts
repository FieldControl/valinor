import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(
    data: Prisma.TaskUncheckedCreateInput,
  ): Promise<Omit<Task, 'projectId' | 'columnId'>> {
    const task = await this.prisma.task.create({
      data,
      select: {
        id: true,
        title: true,
        description: true,
        archived: true,
        column: {
          select: {
            id: true,
            title: true,
          },
        },
        project: true,
      },
    });

    return task;
  }

  async getTaskByProjectAndColumnIds(columnId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        columnId,
      },
    });

    return tasks;
  }

  async getAllTasks() {
    const tasks = await this.prisma.task.findMany();

    return tasks;
  }

  async getTaskById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
      },
    });

    return task;
  }

  async deleteTaskById(id: string) {
    const task = await this.prisma.task.delete({
      where: {
        id,
      },
    });

    return task;
  }

  async updateTaskById(id: string, data: Prisma.TaskUpdateInput) {
    const task = await this.prisma.task.update({
      where: {
        id,
      },
      data,
    });

    return task;
  }
}
