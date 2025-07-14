import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service'; 
import { UpdateUserDto } from './dto/update-user.dto'; 

/**
 * @Controller('users') define a rota base como '/users'.
 * @UseGuards(JwtAuthGuard) protege todos os endpoints neste controller.
 * Apenas utilizadores com um token JWT válido poderão aceder a estas rotas.
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint para obter os dados do utilizador atualmente autenticado.
   * - Rota completa: GET /users/me
   * - @Get('me'): Define a sub-rota.
   * - @Req(): Injeta o objeto 'request' completo da requisição.
   */
  @Get('me')
  getProfile(@Req() req) {
    // A nossa 'JwtStrategy' validou o token e anexou o objeto do utilizador
    // (sem a senha) à requisição em 'req.user'.
    // Nós simplesmente retornamos esse objeto.
    return req.user;
  }

  /**
   * Endpoint para o utilizador logado atualizar o seu próprio perfil.
   * - Rota completa: PATCH /users/me
   */
  @Patch('me')
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    // 'req.user.id' contém a ID do utilizador que vem do token JWT.
    // Isso garante que um utilizador só pode atualizar o seu próprio perfil.
    const userId = req.user.id;
    return this.usersService.update(userId, updateUserDto);
  }
}