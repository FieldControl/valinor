import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service'; // Importa o serviço de usuário
import { UpdateUserDto } from './dto/update-user.dto'; // Importa o DTO para atualização do usuário
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o guard de autenticação

@Controller('user') // Define o endpoint base para este controlador como 'user'
export class UserController {
  constructor(private readonly userService: UserService) {} // Injeta o serviço de usuário

  @Get('getUser') // Define o método HTTP GET para buscar um usuário pelo ID
  @UseGuards(AuthGuard) // Protege a rota com o guard de autenticação
  findOne(@Request() req: PayloadRequest) {
    return this.userService.findOne(req.user.id); // Chama o método do serviço para buscar o usuário
  }

  @Patch() // Define o método HTTP PATCH para atualizar um usuário
  @UseGuards(AuthGuard) // Protege a rota com o guard de autenticação
  update(@Body() updateUserDto: UpdateUserDto, @Request() req: PayloadRequest) {
    return this.userService.update(req.user.id, updateUserDto); // Chama o método do serviço para atualizar o usuário
  }

  @Delete() // Define o método HTTP DELETE para remover um usuário
  @UseGuards(AuthGuard) // Protege a rota com o guard de autenticação
  remove(@Request() req: PayloadRequest) {
    return this.userService.remove(req.user.id); // Chama o método do serviço para remover o usuário
  }
}
