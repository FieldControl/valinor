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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Retorna um usuário específico
  @Get()
  @UseGuards(AuthGuard)
  findOne(@Request() req: PayloadRequest) {
    return this.userService.findOne(req.user.id);
  }

  // Atualiza um usuário
  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() updateUserDto: UpdateUserDto, @Request() req: PayloadRequest) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  // Remove um usuário
  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req: PayloadRequest) {
    return this.userService.remove(req.user.id);
  }
}
