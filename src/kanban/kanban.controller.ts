import { Controller, Get } from '@nestjs/common';
import { KanbanService } from './kanban.service';

@Controller('kanban')
export class KanbanController {
    
  constructor(private kanbanService: KanbanService) { }

  @Get()
  getAllKanbans() {
    return this.kanbanService.getAllKanbans();
  }
}
