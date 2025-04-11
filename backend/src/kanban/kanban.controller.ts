import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddCardDto } from './dto/add-card.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateKanbanDto } from './dto/update-kanban.dto';
import { Kanban } from './kanban.model';
import { KanbanService } from './kanban.service';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Post()
  createKanban(@Body() kanban: Kanban): Kanban {
    console.log('Dados recebidos no backend:', kanban);
    return this.kanbanService.createKanban(kanban);
  }

  @Post('columns')
  createColumn(@Body() createColumnDto: CreateColumnDto) {
    const newColumn = {
      id: Date.now(),
      title: createColumnDto.title,
      cards: [],
    };
    return this.kanbanService.createColumn(newColumn);
  }

  @Post('cards')
  addCardToColumn(@Body() addCardDto: AddCardDto) {
    return this.kanbanService.addCardToColumn(
      addCardDto.columnId,
      addCardDto.item,
    );
  }

  @Post('cards')
  addCard(
    @Body() cardData: { title: string; description: string; columnId: string },
  ) {
    const newCard = this.kanbanService.addCard(cardData);
    return { message: 'Cartão criado com sucesso!', card: newCard };
  }

  @Get()
  getAllKanbans(): Kanban[] {
    return this.kanbanService.getAllKanbans();
  }

  @Get('columns')
  getColumns(): Kanban[] {
    return this.kanbanService.getColumns();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKanbanDto: UpdateKanbanDto,
  ): Kanban | null {
    return this.kanbanService.update(+id, updateKanbanDto);
  }

  @Patch('columns/:id')
  updateColumn(
    @Param('id') id: number,
    @Body() column: Partial<Kanban>,
  ): Kanban | null {
    return this.kanbanService.updateColumn(id, column);
  }

  @Patch('cards/move')
  moveCard(
    @Body()
    {
      card,
      fromColumnId,
      toColumnId,
    }: {
      card: string;
      fromColumnId: number;
      toColumnId: number;
    },
  ): Kanban | null {
    return this.kanbanService.moveCard(card, fromColumnId, toColumnId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Kanban | null {
    return this.kanbanService.remove(+id);
  }
}
