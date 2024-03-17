import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { Request, Response } from 'express';
import { User } from '../user/user.entity';
import { UserService } from './../user/user.service';
import { AuthInput } from './dto/auth.input';
import { AuthType } from './dto/auth.type';
import { RefreshTokenType } from './dto/refreshToken.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(data: AuthInput, res: Response): Promise<AuthType> {
    const user = await this.userService.findUserByEmail(data.email);

    const validPassword = compareSync(data.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Credentials invalid');
    }

    const token = await this.jwtToken(user);
    const refreshToken = await this.jwtRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      secure: true,
      domain: 'localhost',
    });

    return {
      user,
      token,
    };
  }

  async revalidateToken(
    req: Request,
    res: Response,
  ): Promise<RefreshTokenType> {
    const refreshTokenCookie = req.cookies['refreshToken'];

    if (!refreshTokenCookie) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decodedToken = this.jwtService.verify(refreshTokenCookie);

      if (decodedToken && decodedToken.sub) {
        const userId = decodedToken.sub;
        const user = await this.userService.findUserById(userId);

        const token = await this.jwtToken(user);
        const refreshToken = await this.jwtRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
          secure: true,
          domain: 'localhost',
        });

        return {
          token,
        };
      } else {
        throw new UnauthorizedException('Invalid refresh token');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async jwtToken(user: User): Promise<string> {
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.signAsync(payload, { expiresIn: 60 * 60 }); // 1 Hours
  }

  private async jwtRefreshToken(user: User): Promise<string> {
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }
}
