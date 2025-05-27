import { Body, Controller, Post, Get, Param, Put, Delete, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskColumnDto } from './dto/update-task-column.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get(':id')
  getByColumn(@Param('id') id: string) {
    return this.tasksService.getByColumn(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: CreateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Patch(':id/column')
  async updateTaskColumn(
    @Param('id') id: string,
    @Body() updateTaskColumnDto: UpdateTaskColumnDto
  ) {
    return this.tasksService.updateTaskColumn(id, updateTaskColumnDto.columnId);
  }
}
