import { Controller, Post, Body, BadRequestException } from '@nestjs/common'; // Importa os decoradores Controller, Post, Body e BadRequestException do NestJS
import { AuthService } from './auth.service'; // Importa o serviço de autenticação
import { LoginDto } from './dto/login.dto'; // Importa o DTO para informações de login
import { RegisterDto } from './dto/register.dto'; // Importa o DTO para informações de registro
import { UserService } from 'src/user/user.service'; // Importa o serviço de usuário

@Controller('auth') // Define o controlador para a rota '/auth'
export class AuthController {
  constructor(
    private readonly authService: AuthService, // Injeta o serviço de autenticação
    private userService: UserService, // Injeta o serviço de usuário
  ) {}

  // Endpoint para registro de um novo usuário
  @Post('register')
  async create(@Body() registerDto: RegisterDto) {
    registerDto.email = registerDto.email.toLowerCase(); // Converte o e-mail para minúsculas
    const user = await this.userService.create(registerDto); // Chama o método do serviço de usuário para criar um novo usuário
    if (!user) { // Se o usuário não puder ser criado
      throw new BadRequestException('Unable to register'); // Lança uma exceção informando que o registro falhou
    }
    return this.authService.login({ // Realiza o login automaticamente após o registro bem-sucedido
      email: user.email,
      password: registerDto.password,
    });
  }

  // Endpoint para autenticação de um usuário existente
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto); // Chama o método do serviço de autenticação para realizar o login
  }
}
