import { Controller, Get, Body, Patch, Delete, Request, UseGuards} from '@nestjs/common'; // Importa os decoradores e classes necessárias do NestJS
import { UserService } from './user.service'; // Importa o serviço de usuário
import { UpdateUserDto } from './dto/update-user.dto'; // Importa o DTO de atualização de usuário
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o AuthGuard e PayloadRequest para autenticação

@Controller('user') // Define o controlador para a rota 'user'
export class UserController {
  constructor(private readonly userService: UserService) {} // Injeta o serviço de usuário no controlador

  @Get() // Define o método HTTP GET para a rota 'user'
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  findOne(@Request() req: PayloadRequest) { // Define o método para encontrar um usuário
    return this.userService.findOne(req.user.id); // Chama o serviço de usuário para encontrar um usuário pelo ID
  }

  @Patch() // Define o método HTTP PATCH para a rota 'user'
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  update(@Body() updateUserDto: UpdateUserDto, @Request() req: PayloadRequest) { // Define o método para atualizar um usuário
    return this.userService.update(req.user.id, updateUserDto); // Chama o serviço de usuário para atualizar um usuário pelo ID
  }

  @Delete() // Define o método HTTP DELETE para a rota 'user'
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  remove(@Request() req: PayloadRequest) { // Define o método para remover um usuário
    return this.userService.remove(req.user.id); // Chama o serviço de usuário para remover um usuário pelo ID
  }
}
