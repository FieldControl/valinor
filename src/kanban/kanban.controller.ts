import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateKanbanDto } from 'src/DTO/create-kanban-dto';
import { KanbanStatusValidationPipe } from 'src/utils/KanbanStatusValidation.pipe';
import { KanbanStatus } from 'src/Entity/kanban.entity';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/Entity/user.entity';


@Controller('kanban')
@UseGuards(AuthGuard())
export class KanbanController {

  constructor(private kanbanService: KanbanService) { }

  @Get()
  getAllKanbans( @User() user: UserEntity) {
    return this.kanbanService.getAllKanbans(user);
  }

  @Post()
  createNewKanban(@Body(ValidationPipe) data: CreateKanbanDto,  @User() user: UserEntity) {

    return this.kanbanService.createKanban(data, user);
  }

  @Patch(':id')
  updateTodo(
    @Body('status', KanbanStatusValidationPipe) status: KanbanStatus,
    @Param('id') id: number,
    @User() user: UserEntity
  ) {
    return this.kanbanService.update(id, status, user);
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: number, @User() user: UserEntity) {
    return this.kanbanService.delete(id, user);
  }
}
