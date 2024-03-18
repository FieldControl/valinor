import { User as PrismaUser, Prisma } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { UserEntity } from 'src/domain/forum/enterprise/entities/user';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.create(
      {
        email: raw.email,
        password: raw.password,
        name: raw.name,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(user: UserEntity): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
    };
  }
}
