import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AtualizarUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard, PayloadRequest } from '../autenticar/autenticar/autenticar.guard';

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
  atualizar(@Body() atualizarUsuarioDto: AtualizarUsuarioDto, @Request() req: PayloadRequest) {
    return this.usuarioService.atualizar(req.usuario.id, atualizarUsuarioDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  excluir(@Request() req: PayloadRequest) {
    return this.usuarioService.excluir(req.usuario.id);
  }
}
