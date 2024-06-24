import { CreateUserInput } from '@application/dto/userDto/create-user.input';
import { UpdateUserInput } from '@application/dto/userDto/update-user.input';
import { PrismaService } from '@infra/data/client/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { hashSync as bcryptHashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    const { email, password } = createUserInput;

    const pass = password ? bcryptHashSync(password, 10) : undefined;

    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (user) {
      throw new NotFoundException('This email is already in use.');
    }

    return await this.prismaService.user.create({
      data: {
        ...createUserInput,
        password: pass,
      },
    });
  }

  async findAll() {
    return await this.prismaService.user.findMany({
      include: {
        projects: {
          include: {
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
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.user.findFirst({
      where: { id },
      include: {
        projects: {
          include: {
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
        },
      },
    });
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    const { name, email, password, projectIds } = updateUserInput;

    const pass = password ? bcryptHashSync(password, 10) : undefined;

    if (projectIds && projectIds.length > 0) {
      const projects = await this.prismaService.project.findMany({
        where: {
          id: { in: projectIds },
        },
      });

      if (projects.length !== projectIds.length) {
        throw new NotFoundException('One or more project IDs not found');
      }
    }

    return await this.prismaService.user.update({
      where: { id },
      data: {
        name,
        email,
        ...(pass && { password: pass }),
        ...(projectIds && {
          projects: {
            connect: projectIds.map((projectId) => ({ id: projectId })),
          },
        }),
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
