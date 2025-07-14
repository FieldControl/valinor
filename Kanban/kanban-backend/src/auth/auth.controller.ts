// ARQUIVO: src/auth/auth.controller.ts

// Importa os 'decorators' do NestJS para definir rotas e manipular requisições.
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

/**
 * @Controller('auth') define a rota base para todos os endpoints nesta classe.
 * Todas as rotas aqui dentro começarão com '/auth'.
 */
@Controller('auth')
export class AuthController {
  /**
   * O construtor injeta o AuthService. O NestJS fornece a instância do serviço
   * automaticamente, graças ao sistema de Injeção de Dependência.
   * @param authService - A instância do nosso serviço de lógica de autenticação.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para REGISTAR um novo utilizador.
   * - @Post('register'): Define que este método responde a requisições HTTP POST.
   * - Rota completa: POST /auth/register
   * - @HttpCode(HttpStatus.CREATED): Garante que a resposta de sucesso terá o código 201 (Created).
   * - @Body(): Extrai e valida os dados do corpo da requisição usando o RegisterAuthDto.
   * @param registerAuthDto - Os dados (email e senha) para o novo utilizador.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerAuthDto: RegisterAuthDto) {
    // Delega toda a lógica de negócio para o método 'register' do serviço.
    return this.authService.register(registerAuthDto);
  }

  /**
   * Endpoint para LOGIN de um utilizador existente.
   * - Rota completa: POST /auth/login
   * - @HttpCode(HttpStatus.OK): Define que a resposta de sucesso terá o código 200 (OK).
   * @param loginAuthDto - Os dados (email e senha) para o login.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginAuthDto: LoginAuthDto) {
    // Delega toda a lógica de negócio para o método 'login' do serviço.
    return this.authService.login(loginAuthDto);
  }
}