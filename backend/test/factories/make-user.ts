import { faker } from '@faker-js/faker';

import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  UserProps,
  UserEntity,
} from 'src/domain/forum/enterprise/entities/user';
import { PrismaUserMapper } from 'src/infra/database/mappers/prisma-user-mapper';

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = UserEntity.create(
    {
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  );

  return user;
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });

    // @ts-ignore
    return user;
  }
}
