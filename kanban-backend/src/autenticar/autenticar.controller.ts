import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AutenticarService } from './autenticar.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registro.dto';
import { UsuarioService } from '../usuario/usuario.service';

@Controller('autenticar')
export class AutenticarController {
  constructor(
    private readonly autenticarService: AutenticarService,
    private usuarioService: UsuarioService,
  ) {}

  @Post('registro')
  async create(@Body() registrarDto: RegistrarDto) {
    registrarDto.email = registrarDto.email.toLowerCase();
    const usuario = await this.usuarioService.criar(registrarDto);
    if (!usuario) {
      throw new BadRequestException('Nao foi possível registrar');
    }
    return this.autenticarService.login({
      email: usuario.email,
      senha: registrarDto.senha,
    });
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.autenticarService.login(loginDto);
  }
}
