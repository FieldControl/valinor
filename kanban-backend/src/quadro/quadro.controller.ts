import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuadroService } from './quadro.service';
import { CriarQuadroDto } from './dto/create-quadro.dto';
import { AtualizarQuadroDto } from './dto/update-quadro.dto';
import { AuthGuard, PayloadRequest } from '../autenticar/autenticar/autenticar.guard';

@Controller('quadro')
export class QuadroController {
  constructor(private readonly quadroService: QuadroService) {}

  @Post()
  @UseGuards(AuthGuard)
  criar(
    @Body() criarQuadroDto: CriarQuadroDto,
    @Request() req: PayloadRequest,
  ) {
    return this.quadroService.criar(criarQuadroDto, req.usuario.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req: PayloadRequest) {
    return this.quadroService.encontrarTodosUsuariosPorId(req.usuario.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) {
    const quadro = await this.quadroService.findOne(+id, req.usuario.id);
    quadro.colunas = quadro.colunas.sort((a, b) => a.ordem - b.ordem);
    quadro.colunas.forEach((colunas) => {
      colunas.cartoes = colunas.cartoes.sort((a, b) => a.ordem - b.ordem);
    });
    return quadro;
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  atualizar(
    @Param('id') id: string,
    @Request() req: PayloadRequest,
    @Body() atualizarQuadroDto: AtualizarQuadroDto,
  ) {
    return this.quadroService.atualizar(+id, req.usuario.id, atualizarQuadroDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  excluir(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.quadroService.excluir(+id, req.usuario.id);
  }
}
