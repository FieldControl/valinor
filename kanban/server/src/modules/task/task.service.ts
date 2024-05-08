import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskDTO } from './task.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaClient) {}

  async findAllTasks() {
    return await this.prisma.task.findMany();
  }

  async getTaskById(id: string) {
    const taskExists = await this.prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!taskExists) {
      throw new NotFoundException('Task not found');
    }

    return taskExists;
  }

  async createTask(data: TaskDTO) {
    if (!data.columnId) {
      throw new Error('columnId is required');
    }

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        column: {
          connect: {
            id: data.columnId,
          },
        },
      },
    });

    return task;
  }

  async updateTask(id: string, data: TaskDTO) {
    const taskExists = await this.prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!taskExists) {
      throw new NotFoundException('Task not found');
    }

    return await this.prisma.task.update({
      data,
      where: {
        id,
      },
    });
  }

  async deleteTask(id: string) {
    const taskExists = await this.prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!taskExists) {
      throw new NotFoundException('Task not found');
    }

    return await this.prisma.task.delete({
      where: {
        id,
      },
    });
  }
}
