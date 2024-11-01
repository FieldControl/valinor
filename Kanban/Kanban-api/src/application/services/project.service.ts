import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectInput } from '../dto/projectDto/create-project.input';
import { UpdateProjectInput } from '../dto/projectDto/update-project.input';
import { PrismaService } from '@infra/data/client/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProjectInput: CreateProjectInput) {
    const { title, description, userIds } = createProjectInput;

    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('At least one user ID must be provided');
    }

    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: userIds },
      },
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more user IDs not found');
    }

    return await this.prismaService.project.create({
      data: {
        title,
        description,
        users: {
          connect: userIds.map((id) => ({ id })),
        },
      },
      include: {
        users: true,
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });
  }

  async findAll() {
    return await this.prismaService.project.findMany({
      include: {
        users: true,
        columns: {
          include: {
            tasks: {
              include: {
                column: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.project.findFirst({
      where: { id },
      include: {
        users: true,
        columns: {
          include: {
            tasks: {
              include: {
                column: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateProjectInput: UpdateProjectInput) {
    const { title, description, userIds, columnIds } = updateProjectInput;

    if (userIds && userIds.length > 0) {
      const users = await this.prismaService.user.findMany({
        where: {
          id: { in: userIds },
        },
      });

      if (!users) {
        throw new NotFoundException('User Not found');
      }
    }

    if (columnIds && columnIds.length > 0) {
      const columns = await this.prismaService.column.findMany({
        where: {
          id: { in: columnIds },
        },
      });

      if (!columns) {
        throw new NotFoundException('Column Not found');
      }
    }

    return await this.prismaService.project.update({
      where: { id },
      data: {
        title,
        description,
        ...(userIds && {
          users: {
            connect: userIds.map((userId) => ({ id: userId })),
          },
        }),
        ...(columnIds && {
          columns: {
            connect: columnIds.map((columnId) => ({ id: columnId })),
          },
        }),
      },
      include: {
        users: true,
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.project.delete({
      where: { id },
    });
  }
}
