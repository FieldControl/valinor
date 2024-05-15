import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { UsuarioService } from 'src/usuario/usuario.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly usuarioService: UsuarioService
  ) {}

  /**
   * Realiza o login do usuario baseado no e-mail e senha, retorna o id do usuario simulando uma autenticação
   */
  @Post('login')
  login(@Body() createAuthDto: LoginDto) {
    return this.authService.login(createAuthDto);
  }

  
    /**
   * Registra um usuario, padroniza o e-mail pra ser todo lower case
   * faz validações pra ver se o usuario já existe.
   * Poderia fazer validações de politicas do password, tamanho minimo, palavras proibidas como o proprio nome ou outros.
   * Após fazer o registro, já tenta autenticar, retornando o também o usuarioId como uma simulação do token.
   */
  @Post('register')
  async create(@Body() registroDto: RegistroDto) {
    registroDto.email = registroDto.email.toLowerCase();
    const user = await this.usuarioService.create(registroDto);
    if (!user) {
      throw new BadRequestException('Unable to register');
    }
    return this.authService.login({
      email: user.email,
      senha: registroDto.senha,
    });
  }


}
