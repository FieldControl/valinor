import { Body, Controller, Delete, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateKanbanDto } from 'src/DTO/create-kanban-dto';
import { KanbanStatusValidationPipe } from 'src/utils/KanbanStatusValidation.pipe';
import { KanbanStatus } from 'src/Entity/kanban.entity';

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

  @Patch(':id')
  updateTodo(
    @Body('status', KanbanStatusValidationPipe) status: KanbanStatus,
    @Param('id') id: number
  ) {
    return this.kanbanService.update(id, status);
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: number) {
    return this.kanbanService.delete(id);
  }
}
