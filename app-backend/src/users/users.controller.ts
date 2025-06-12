import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(0)
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(0)
  @ApiOperation({ summary: 'Atualizar role de um usuário (Somente admin)' })
  @ApiResponse({ status: 200, description: 'Role atualizada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Permissão negada.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, dto.tipo);
  }
}
