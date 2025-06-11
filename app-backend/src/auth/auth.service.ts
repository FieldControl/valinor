// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      tipo: user.tipo,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    tipo?: number;
  }): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.createUser(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
