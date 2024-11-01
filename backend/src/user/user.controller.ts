import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';

@Controller('user') // Define a rota base para usuários
export class UserController {
  constructor(private readonly userService: UserService) {} // Injeta o UserService

  @Get() // Método para obter informações do usuário autenticado
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  findOne(@Request() req: PayloadRequest) {
    return this.userService.findOne(req.user.id); // Chama o serviço para encontrar o usuário
  }

  @Patch() // Método para atualizar informações do usuário
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  update(@Body() updateUserDto: UpdateUserDto, @Request() req: PayloadRequest) {
    return this.userService.update(req.user.id, updateUserDto); // Chama o serviço para atualizar o usuário
  }

  @Delete() // Método para remover o usuário
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  remove(@Request() req: PayloadRequest) {
    return this.userService.remove(req.user.id); // Chama o serviço para remover o usuário
  }
}
