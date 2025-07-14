// ARQUIVO: src/columns/columns.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('columns')
@UseGuards(JwtAuthGuard) // Todas as rotas aqui continuam protegidas.
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(@Body() createColumnDto: CreateColumnDto, @Req() req) {
    // Extraímos a ID do utilizador do objeto 'req.user' que o nosso
    // JwtAuthGuard/JwtStrategy adicionou à requisição.
    const userId = req.user.id; //  Pega a ID do utilizador logado.
    return this.columnsService.create(createColumnDto, userId); //  Passa a ID para o serviço.
  }

  @Get()
  findAll(@Req() req) {
    const userId = req.user.id; //  Pega a ID do utilizador logado.
    return this.columnsService.findAll(userId); //  Passa a ID para o serviço.
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id; //  Pega a ID do utilizador logado.
    return this.columnsService.remove(+id, userId); //  Passa ambas as IDs para o serviço.
  }
}