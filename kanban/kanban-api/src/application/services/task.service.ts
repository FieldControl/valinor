import { CreateTaskInput } from '@application/dto/taskDto/create-task.input';
import {
  UpdateTaskInput,
  UpdateTasksInput,
} from '@application/dto/taskDto/update-task.input';
import { PrismaService } from '@infra/data/client/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class TaskService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTaskInput: CreateTaskInput) {
    const { title, description, columnId, order } = createTaskInput;

    let newOrder = order;

    if (newOrder === undefined) {
      const maxOrderTask = await this.prismaService.task.findFirst({
        where: { columnId },
        orderBy: {
          order: 'desc',
        },
        select: {
          order: true,
        },
      });

      newOrder = (maxOrderTask?.order ?? 0) + 1;
    }

    return await this.prismaService.task.create({
      data: {
        title,
        description,
        order: newOrder,
        column: {
          connect: { id: columnId },
        },
      },
      include: {
        column: true,
      },
    });
  }

  async findAll() {
    return await this.prismaService.task.findMany({
      include: {
        column: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.task.findFirst({
      where: { id },
      include: {
        column: true,
      },
    });
  }

  async update(id: string, updateTaskInput: UpdateTaskInput) {
    const { title, description, columnId, order } = updateTaskInput;

    if (columnId && columnId.length > 0) {
      const column = await this.prismaService.column.findFirst({
        where: { id: columnId },
      });

      if (!column) {
        throw new NotFoundException('Colum Not found');
      }
    }

    return await this.prismaService.task.update({
      where: { id },
      data: {
        title,
        description,
        order,
        ...(columnId && {
          column: { connect: { id: columnId } },
        }),
      },
      include: {
        column: true,
      },
    });
  }

  async updateMany(updateTasksInput: UpdateTasksInput) {
    const { tasks } = updateTasksInput;

    const updatePromises = tasks.map((task) => {
      const { id, title, description, columnId, order } = task;

      return this.prismaService.task.update({
        where: { id },
        data: {
          title,
          description,
          order,
          ...(columnId && {
            column: {
              connect: { id: columnId },
            },
          }),
        },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          column: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    });

    return await this.prismaService.$transaction(updatePromises);
  }

  async remove(id: string) {
    return this.prismaService.task.delete({
      where: { id },
    });
  }
}
