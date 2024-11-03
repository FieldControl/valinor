import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService,private readonly usersService: UsersService) {}

  async login(user: LoginDto) {
    const userDatabase = await this.usersService.findOneByUsername(user.username);
    if (!userDatabase || !(await bcrypt.compare(user.password, userDatabase.password))) {
      throw new UnauthorizedException();
    }

    const payload = { username: user.username, sub: userDatabase.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}