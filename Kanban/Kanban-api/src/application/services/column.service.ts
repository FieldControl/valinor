import { CreateColumnInput } from '@application/dto/columnDto/create-column.input';
import {
  UpdateColumnInput,
  UpdateColumnsInput,
} from '@application/dto/columnDto/update-column.input';
import { PrismaService } from '@infra/data/client/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ColumnService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createColumnInput: CreateColumnInput) {
    const { title, description, projectId, order } = createColumnInput;

    const project = await this.prismaService.project.findFirst({
      where: { id: projectId },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    let newOrder = order;

    if (newOrder === undefined) {
      const maxOrderTask = await this.prismaService.column.findFirst({
        where: { projectId },
        orderBy: {
          order: 'desc',
        },
        select: {
          order: true,
        },
      });

      newOrder = (maxOrderTask?.order ?? 0) + 1;
    }

    return await this.prismaService.column.create({
      data: {
        title,
        description,
        order: newOrder,
        project: {
          connect: { id: projectId },
        },
      },
      include: {
        project: true,
        tasks: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async findAll() {
    return await this.prismaService.column.findMany({
      include: {
        project: true,
        tasks: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.column.findFirst({
      where: { id },
      include: {
        project: true,
        tasks: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async update(id: string, updateColumnInput: UpdateColumnInput) {
    const { title, description, projectId, taskIds } = updateColumnInput;

    if (projectId && projectId.length > 0) {
      const project = await this.prismaService.project.findFirst({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project Not found');
      }
    }

    if (taskIds && taskIds.length > 0) {
      const tasks = await this.prismaService.task.findMany({
        where: {
          id: { in: taskIds },
        },
      });

      if (!tasks) {
        throw new NotFoundException('Task Not found');
      }
    }

    return await this.prismaService.column.update({
      where: { id },
      data: {
        title,
        description,
        ...(projectId && {
          project: {
            connect: { id: projectId },
          },
        }),
        ...(taskIds && {
          tasks: {
            connect: taskIds.map((taskId) => ({ id: taskId })),
          },
        }),
      },
      include: {
        project: true,
        tasks: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async updateMany(updateColumnsInput: UpdateColumnsInput) {
    const { columns } = updateColumnsInput;

    const updatePromises = columns.map((column) => {
      const { id, title, description, projectId, taskIds, order } = column;

      return this.prismaService.column.update({
        where: { id },
        data: {
          title,
          description,
          order,
          ...(projectId && {
            project: {
              connect: { id: projectId },
            },
          }),
          ...(taskIds && {
            tasks: {
              connect: taskIds.map((taskId) => ({ id: taskId })),
            },
          }),
        },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          tasks: {
            select: {
              id: true,
              title: true,
              column: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    });

    return await this.prismaService.$transaction(updatePromises);
  }

  async remove(id: string) {
    return this.prismaService.column.delete({
      where: { id },
    });
  }
}
