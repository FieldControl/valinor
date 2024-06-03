import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsuarioService } from 'src/usuario/usuario.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private usuarioService: UsuarioService,
  ) {}
  @Post('register')
  async create(@Body() registerDto: RegisterDto) {
    registerDto.email = registerDto.email.toLowerCase();
    const user = await this.usuarioService.create(registerDto);
    if (!user) {
      throw new BadRequestException('Nao foi possivel se registrar');
    }
    return this.authService.login({
      email: user.email,
      senha: registerDto.senha,
    });
  }
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

}
