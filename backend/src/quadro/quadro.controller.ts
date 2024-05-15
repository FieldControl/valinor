import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe, Header, NotFoundException } from '@nestjs/common';
import { QuadroService } from './quadro.service';
import { CreateQuadroDto } from './dto/create-quadro.dto';
import { UpdateQuadroDto } from './dto/update-quadro.dto';
import { AuthGuard } from 'src/auth/auth/auth.guard';
import { Headers } from '@nestjs/common/decorators/http/route-params.decorator';



@Controller('/quadro')
@UseGuards(AuthGuard)
export class QuadroController {
  constructor(private readonly quadroService: QuadroService) {}

  /**
   *  Cria um quadro e já vincula ele ao usuário que estava lá no header 'authorization', simulando que
   * o quadro foi criado para o usuário autenticado.
   */
  @Post()
  create(@Body() createQuadroDto: CreateQuadroDto,
        @Headers('Authorization') userId: string,
      ) {
    return this.quadroService.create(createQuadroDto, +userId);
  }

  /**
   *  Encontra os quadros do usuario autenticado, que o 'token' estaria no authorization.(apesar de só estarmos
   * guardando o usuarioId lá)
   */
  @Get()
  findAll(@Headers('Authorization') userId: string) {
    return this.quadroService.findAllByUserId(+userId);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string, @Headers('Authorization') userId: string) {
    const quadro = await this.quadroService.findOne(+id, +userId);

    if(!quadro) {
      throw new NotFoundException('Quadro não encontrado')
    }

    // Uma lógica mais ou menos que representaria já toda a estrutura de Quadro -> Colunas(ordenadas pela ordem)
    // -> Tarefas(também ordenadas)
    quadro.colunas = quadro.colunas?.sort((a, b) => a.ordem - b.ordem);
    quadro.colunas?.forEach((coluna) => {
      coluna.tarefas = coluna.tarefas.sort((a, b) => a.ordem - b.ordem);
    });
    return quadro;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('Authorization') userId: string, @Body() updateQuadroDto: UpdateQuadroDto) {
    return this.quadroService.update(+id, +userId, updateQuadroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('Authorization') userId: string) {
    return this.quadroService.remove(+id, +userId);
  }
}
