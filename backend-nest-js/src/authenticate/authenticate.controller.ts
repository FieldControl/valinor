import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { LoginDto } from './dto/login.dto';

@Controller('authenticate')
export class AuthenticateController {
  constructor(private readonly authenticateService: AuthenticateService) {}

  @Post('login')
  create(@Body() loginDto: LoginDto) {
    return this.authenticateService.login(loginDto);
  }

}
