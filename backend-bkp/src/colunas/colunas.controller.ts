import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body
} from '@nestjs/common';
import { ColunasService } from './colunas.service';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('colunas')
export class ColunasController {
    constructor(private readonly colunasService: ColunasService) {}

    @Get()
    findAll() {
        return this.colunasService.findAll();
    }

    @Post()
    create(@Body() dto: CreateColunaDto) {
        return this.colunasService.create(dto.titulo);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateColunaDto) {
        return this.colunasService.updateColuna(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        this.colunasService.remove(id);
        return { message: 'Coluna removida' };
    }

    @Post(':colunaId/cards')
    createCard(
        @Param('colunaId') colunaId: string,
        @Body() dto: CreateCardDto
    ) {
        return this.colunasService.createCard(colunaId, dto.titulo, dto.descricao);
    }

    @Put('/cards/:cardId')
    updateCard(
        @Param('cardId') cardId: string,
        @Body() dto: UpdateCardDto
    ) {
        return this.colunasService.updateCard(cardId, dto);
    }

    @Delete('/cards/:cardId')
    removeCard(@Param('cardId') cardId: string) {
        this.colunasService.removeCard(cardId);
        return { message: 'Card removido' };
    }
}
