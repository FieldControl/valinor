import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../common/hash/hash.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './entities/auth-response.entity';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.comparePassword(
      password,
      user.vc_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    
    const payload = { 
      sr_id: user.sr_id,
      email: user.vc_email, 
      name: user.vc_name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.sr_id,
        name: user.vc_name,
        email: user.vc_email,
        createdAt: user.dt_createdAt,
      },
    };
  }
}

