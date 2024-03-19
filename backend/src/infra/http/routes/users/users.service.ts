import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { UserAlreadyExistsError } from 'src/core/errors/user-already-exists-error';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUsers(data: Prisma.UserUncheckedCreateInput) {
    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError(data.email);
    }

    const hashedPassword = await hash(data.password, 6);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  }
}
