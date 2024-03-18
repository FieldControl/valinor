import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compare } from 'bcryptjs';
import { WrongCredentialsError } from 'src/core/errors/wrong-credentials-error';
import { Encrypter } from 'src/domain/forum/application/cryptography/encrypter';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class AuthenticateService {
  constructor(
    private prisma: PrismaService,
    private encrypter: Encrypter,
  ) {}

  async createAuth(data: Prisma.UserUncheckedCreateInput): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new WrongCredentialsError();
    }

    const isPasswordValid = await compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new WrongCredentialsError();
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    });

    return accessToken;
  }
}
