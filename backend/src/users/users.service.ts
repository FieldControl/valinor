import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(username: string, email: string, password: string, role: Role): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        email,   // variável correta aqui
        password: hashed,
        role,
      },
    });
  }

  async findAllMembers(): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      where: { role: 'MEMBER' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
