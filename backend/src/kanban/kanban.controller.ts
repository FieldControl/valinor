import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto): Promise<any> {
    return this.kanbanService.create(createCardDto);
  }

  @Get()
  findAll(): Promise<any[]> {
    return this.kanbanService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto): Promise<any> {
    return this.kanbanService.update(id, updateCardDto);
  }

  @Patch(':id/status') // <-- endpoint novo e exclusivo só para mover status
  moveCard(@Param('id') id: string, @Body() status: { status: string }): Promise<any> {
    return this.kanbanService.moveCard(id, status.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.kanbanService.remove(id);
  }
}
