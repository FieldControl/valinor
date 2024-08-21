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
  Put,
} from '@nestjs/common';
import { ColunaService } from './coluna.service';
import { CriarColunaDto } from './dto/create-coluna.dto';
import { AtualizarColunaDto } from './dto/update-coluna.dto';
import { AuthGuard, PayloadRequest } from '../autenticar/autenticar/autenticar.guard';
import { ReordenarColunaDto } from './dto/reorder-coluna';

@Controller('coluna')
export class ColunaController {
  constructor(private readonly colunaService: ColunaService) {}

  @Post()
  @UseGuards(AuthGuard)
  criar(
    @Request() req: PayloadRequest,
    @Body() criarColunaDto: CriarColunaDto,
  ) {
    return this.colunaService.criar(criarColunaDto, req.usuario.id);
  }

  @Put('atualizar-ordem')
  @UseGuards(AuthGuard)
  atualizarOrdem(
    @Request() req: PayloadRequest,
    @Body() reordenarColuna: ReordenarColunaDto,
  ) {
    return this.colunaService.atualizarOrdemColuna(
      reordenarColuna,
      req.usuario.id,
    );
  }

  @Get('/quadro/:quadroId')
  @UseGuards(AuthGuard)
  encontrarTudo(@Param('quadroId') quadroId: string, @Request() req: PayloadRequest) {
    return this.colunaService.encontrarTodosQuadrosPorId(Number(quadroId), req.usuario.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  atualizar(
    @Param('id') id: string,
    @Body() atualizarColunaDto: AtualizarColunaDto,
    @Request() req: PayloadRequest,
  ) {
    return this.colunaService.atualizar(+id, req.usuario.id, atualizarColunaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  excluir(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.colunaService.excluir(+id, req.usuario.id);
  }
}
