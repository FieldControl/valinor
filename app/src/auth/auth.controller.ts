import { Controller, Post, Body, BadRequestException } from '@nestjs/common'; // Importando os decoradores e classes necessárias do NestJS

import { LoginDto } from './dto/login.dto'; // Importando o DTO de login
import { RegisterDto } from './dto/register.dto'; // Importando o DTO de registro

import { AuthService } from './auth.service'; // Importando o serviço de autenticação
import { UserService } from 'src/user/user.service'; // Importando o serviço de usuário

@Controller('auth') // Definindo o controlador para o caminho 'auth'
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register') // Definindo o endpoint para registro de usuário

  // O método 'create' é responsável por registrar um novo usuário no sistema.
  async create(@Body() registerDto: RegisterDto) { // Recebendo os dados de registro do corpo da requisição
    registerDto.email = registerDto.email.toLowerCase(); // Convertendo o email para minúsculas
    const user = await this.userService.create(registerDto); // Chamando o serviço de usuário para criar um novo usuário

    // Verificando se o usuário foi criado com sucesso
    if (!user) {
      throw new BadRequestException('Não foi possível cadastrar o usuário');
    }
    return this.authService.login({ // Chamando o serviço de autenticação para fazer login automaticamente após o registro
      email: user.email,
      password: registerDto.password,
    });
  }

  @Post('login') // Definindo o endpoint para login de usuário

  // O método 'login' é responsável por autenticar um usuário no sistema.
  login(@Body() loginDto: LoginDto) { // Recebendo os dados de login do corpo da requisição
    return this.authService.login(loginDto); // Chamando o serviço de autenticação para fazer o login
  }
}
