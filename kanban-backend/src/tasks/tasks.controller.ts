import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body('columnId') columnId: number,
    @Body('title') title: string,
    @Body('order') order: number,
    @Body('description') description?: string,
  ) {
    return this.tasksService.create(columnId, title, order, description);
  }

  @Get('column/:columnId')
  findAll(@Param('columnId') columnId: string) {
    return this.tasksService.findAll(+columnId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(+id);
  }
}
