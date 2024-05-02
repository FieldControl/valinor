import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';

import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const { accessToken } = await this.authService.login(loginDto);
      return { accessToken };
    } catch (error) {
      throw new HttpException('Credencias Inválidas', HttpStatus.UNAUTHORIZED);
    }
  }
}
