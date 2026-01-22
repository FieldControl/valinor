import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginInput } from './dto/login-input';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Valida se o usuário existe e a senha está correta
  async validateUser(loginInput: LoginInput): Promise<User> {
    const user = await this.usersService.findOneByEmail(loginInput.email);

    if (user && (await bcrypt.compare(loginInput.password, user.password))) {
      return user;
    }

    throw new UnauthorizedException('Email ou senha incorretos');
  }

  // 2. Gera o Token (Crachá)
  async login(user: User) {
    const payload = { username: user.name, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}