import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateKanbanDto } from 'src/DTO/create-kanban-dto';

@Controller('kanban')
export class KanbanController {
    
  constructor(private kanbanService: KanbanService) { }

  @Get()
  getAllKanbans() {
    return this.kanbanService.getAllKanbans();
  }

  @Post()
  createNewKanban(@Body(ValidationPipe) data: CreateKanbanDto) { 

    return this.kanbanService.createKanban(data);
  }
}
