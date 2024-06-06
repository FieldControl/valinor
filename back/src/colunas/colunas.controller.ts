import { Controller, Get, Request, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ColunasService } from './colunas.service';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
import { AuthGuard, PayloadRequest } from '../auth/auth/auth.guard';
import { ReordereColunaDto } from './dto/reorder-coluna.dto';

@Controller('colunas')
export class ColunasController {
  constructor(private readonly colunasService: ColunasService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req: PayloadRequest,@Body() createColunaDto: CreateColunaDto,) {
    return this.colunasService.create(createColunaDto, req.usuario.id);
  }

  @Put('update-order')
  @UseGuards(AuthGuard)
  updateOrder(@Request() req: PayloadRequest,@Body() reorderedColunas: ReordereColunaDto,) {
    return this.colunasService.updateOrdemDeColunas(
      reorderedColunas,
      req.usuario.id,
    );
  }

  @Get('/quadro/:quadroId')
  @UseGuards(AuthGuard)
  findAll(@Param('quadroId') quadroId: string, @Request() req: PayloadRequest) {
    return this.colunasService.findAllByQuadroId(Number(quadroId), req.usuario.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,@Body() updateColunaDto: UpdateColunaDto,@Request() req: PayloadRequest,) {
    return this.colunasService.update(+id, req.usuario.id, updateColunaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.colunasService.remove(+id, req.usuario.id);
  }
}
