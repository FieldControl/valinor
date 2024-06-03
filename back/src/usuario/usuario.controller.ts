import { Controller,Request, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(AuthGuard)
  findOne(@Request() req: PayloadRequest) {
    return this.usuarioService.findOne(req.usuario.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req: PayloadRequest) {
    return this.usuarioService.update(req.usuario.id, updateUsuarioDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req: PayloadRequest) {
    return this.usuarioService.remove(req.usuario.id);
  }

 
}
