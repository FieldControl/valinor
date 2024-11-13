import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthInput } from './dto/auth.input';
import { compareSync, hashSync } from 'bcrypt';
import { AuthType } from './dto/auth.type';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { SignupInput } from './dto/auth.signup';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(data: AuthInput): Promise<AuthType> {
    const user = await this.userService.findUserByEmail(data.email);
    const validPassword = compareSync(data.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Incorrect Password');
    }

    const token = await this.jwtToken(user);

    return {
      user,
      token,
    };
  }

  async signup(data: SignupInput): Promise<AuthType> {
    const existingUser = await this.userService.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = hashSync(data.password, 10);
    const newUser = await this.userService.createUser({
      ...data,
      password: hashedPassword,
    });

    const token = await this.jwtToken(newUser);

    return {
      user: newUser,
      token,
    };
  }

  async logout(userId: number): Promise<boolean> {
    await this.userService.updateUser(userId, { lastLoginAt: new Date() });
    return true;
  }

  private async jwtToken(user: User): Promise<string> {
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.signAsync(payload);
  }
}
