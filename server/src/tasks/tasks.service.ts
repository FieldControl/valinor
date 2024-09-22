import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const newTask = await this.prismaService.task.create({
      data: {
        ...createTaskDto,
      },
    });

    return newTask;
  }

  async findAll() {
    const tasks = await this.prismaService.task.findMany();

    return tasks;
  }

  async findOne(taskId: string) {
    const task = await this.prismaService.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) throw new NotFoundException('task not found');

    return task;
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(taskId);

    const updatedTask = await this.prismaService.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...updateTaskDto,
      },
    });

    return updatedTask;
  }

  async remove(taskId: string) {
    await this.findOne(taskId);

    await this.prismaService.task.delete({
      where: {
        id: taskId,
      },
    });
  }
}
