import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { success } = await this.authService.login(body.email, body.password);

    if (!success) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return { message: 'Login bem-sucedido' };
  }
}