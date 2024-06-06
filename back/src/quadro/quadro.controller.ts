import { Controller, Request, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { QuadroService } from './quadro.service';
import { CreateQuadroDto } from './dto/create-quadro.dto';
import { UpdateQuadroDto } from './dto/update-quadro.dto';
import { AuthGuard, PayloadRequest } from '../auth/auth/auth.guard';

@Controller('quadro')
export class QuadroController {
  constructor(private readonly quadroService: QuadroService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createQuadroDto: CreateQuadroDto, @Request() req: PayloadRequest,) {
    return this.quadroService.create(createQuadroDto, req.usuario.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req: PayloadRequest) {
    return this.quadroService.findAllByUsuarioId(req.usuario.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) {
    const quadro = await this.quadroService.findOne(+id, req.usuario.id);
    quadro.colunas = quadro.colunas.sort((a, b) => a.ordem - b.ordem);
    quadro.colunas.forEach((coluna) => {
      coluna.cards = coluna.cards.sort((a, b) => a.ordem - b.ordem);
    });
    return quadro;
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string,@Request() req: PayloadRequest,@Body() updateQuadroDto: UpdateQuadroDto,) {
    return this.quadroService.update(+id, req.usuario.id, updateQuadroDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.quadroService.remove(+id, req.usuario.id);
  }
}