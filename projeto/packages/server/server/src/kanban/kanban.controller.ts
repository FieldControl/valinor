import { Controller, Get, Post, Param, Body, Put, Delete, ParseIntPipe, BadRequestException} from '@nestjs/common';
import { KanbanService } from './kanban.service';
//A controller indica aonde vai ser feito a requisição POST, GET, PUT ou DELETE dentro do backend, com parametros e caminhos.
@Controller('kanban')
export class KanbanController {
    constructor (private readonly kanbanService: KanbanService){}

    @Post('colunas')
    async criaColuna(@Body('titulo') titulo: string){
        return this.kanbanService.criaColuna(titulo);
    }

    @Get('colunas')
    async pegaColunas(){
        return this.kanbanService.pegaColunas();
    }


    @Post('cards/:idColuna')
    async criaCard(@Body() cardData: { titulo: string, descricao: string, colunaId: number }) 
    {
        console.log('Recebendo dados de card:', cardData);
        console.log(cardData.colunaId);
        return this.kanbanService.criaCard(cardData.colunaId, cardData.titulo, cardData.descricao);
    }


    @Get('cards/:idColuna')
    async getCards(@Param('idColuna') idColuna: number) {
      return await this.kanbanService.getCardsByColuna(idColuna);
    }
  
    @Delete('colunas/:colunaId/cards/:cardId')
    async deletarCard(
        @Param('colunaId', ParseIntPipe) colunaId: number,
        @Param('cardId', ParseIntPipe) cardId: number,
    ): Promise<void> {
        return this.kanbanService.deletarCard(colunaId, cardId);
    }

    @Put('colunas/:colunaId/cards/:cardId')
    async editarCard(
        @Param('colunaId', ParseIntPipe) colunaId: number,
        @Param('cardId', ParseIntPipe) cardId: number,
        @Body() cardData: {titulo: string; descricao: string }
    ): Promise<void> {
        return this.kanbanService.editarCard(colunaId, cardId, cardData.titulo, cardData.descricao);
    }

    @Put('colunas/:colunaId')
    async editarColuna(
        @Param('colunaId', ParseIntPipe) colunaId: number,
        @Body('titulo') titulo: string
    ): Promise<void> {
        console.log('Recebendo colunaId:', colunaId);
        console.log('Recebendo novo título:', titulo);
    if (!titulo || titulo.trim() === '') {
        throw new BadRequestException('O título não pode ser vazio.');
    }

    return this.kanbanService.editarColuna(colunaId, titulo);
    }
}
