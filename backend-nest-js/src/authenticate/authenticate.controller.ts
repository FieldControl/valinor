
//controller responsavel apenas por validação de usuarios, Registro e Logins!

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
    //armazenando dados de usuario cadastrado na variavel user.
    const user = await this.userService.RegisterNewUser(RegisterDto);
    //confirmando se usuario foi cadastrado
    if(!user){
      throw new BadRequestException('Usuario não registrado');
    }
    //fazendo validação dos dados e liberação de acesso, atraves da função login.
    return this.authenticateService.login({
      email: RegisterDto.email,
      password: RegisterDto.password,
    });
  }

  //liberando acesso ao usuario, função login.
  @Post('login')
  create(@Body() loginDto: LoginDto) {
    return this.authenticateService.login(loginDto);
  }

}
