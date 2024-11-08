import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async create(@Body() RegisterDto: RegisterDto) {
    RegisterDto.emailUser = RegisterDto.emailUser.toLowerCase();
    const user = await this.userService.create(RegisterDto);
    if (!user) {
      throw new BadRequestException('não foi possível registrar');
    }
    return this.authService.login({
      emailUser: user.emailUser,
      passwordUser: RegisterDto.passwordUser,
    });
  }

  @Post('login')
  login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }
}
