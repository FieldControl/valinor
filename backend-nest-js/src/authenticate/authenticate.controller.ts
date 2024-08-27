import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { LoginDto } from './dto/login.dto';
import { registerDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';

@Controller('authenticate')
export class AuthenticateController {
  constructor(
    private readonly authenticateService: AuthenticateService,
    private userService : UserService,
  ) {}

  //registrando novo usuario no banco de dados.
  @Post('register')
  async RegisterNewUser(@Body() RegisterDto: registerDto) {
    console.log(RegisterDto)
    const user = await this.userService.RegisterNewUser(RegisterDto);
    if(!user){
      throw new BadRequestException('Usuario não registrado');
    }
    return this.authenticateService.login({
      email: user.email,
      password: user.password,
    });
  }

  //liberando acesso ao usuario
  @Post('login')
  create(@Body() loginDto: LoginDto) {
    return this.authenticateService.login(loginDto);
  }

}
