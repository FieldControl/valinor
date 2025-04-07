import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '1234';

    const success = email === adminEmail && password === adminPassword;

    return { success };
  }
}