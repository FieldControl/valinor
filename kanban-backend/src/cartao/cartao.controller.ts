import {
  Controller,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CartaoService } from './cartao.service';
import { CriarCartaoDto } from './dto/create-cartao.dto';
import { AtualizarCartaoDto } from './dto/update-cartao.dto';
import { AuthGuard, PayloadRequest } from '../autenticar/autenticar/autenticar.guard';
import { ReordenarCartaoDto } from './dto/reorder-cartao';

@Controller('cartao')
export class CartaoController {
  constructor(private readonly cartaoService: CartaoService) {}

  @Post()
  @UseGuards(AuthGuard)
  criar(@Body() criarCartaoDto: CriarCartaoDto, @Request() req: PayloadRequest) {
    return this.cartaoService.criar(criarCartaoDto, req.usuario.id);
  }

  @Put('atualizar-ordem')
  @UseGuards(AuthGuard)
  atualizarOrdem(
    @Body() reordenarCartoes: ReordenarCartaoDto,
    @Request() req: PayloadRequest,
  ) {
    return this.cartaoService.atualizarOrdemCartaoEColuna(
      reordenarCartoes,
      req.usuario.id,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  atualizar(
    @Param('id') id: string,
    @Request() req: PayloadRequest,
    @Body() atualizarCartaoDto: AtualizarCartaoDto,
  ) {
    return this.cartaoService.atualizar(+id, req.usuario.id, atualizarCartaoDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  excluir(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.cartaoService.excluir(+id, req.usuario.id);
  }
}
