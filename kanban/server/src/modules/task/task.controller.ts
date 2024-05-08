import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskDTO } from './task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAllTasks() {
    return this.taskService.findAllTasks();
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Post()
  async create(@Body() data: TaskDTO) {
    return this.taskService.createTask(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: TaskDTO) {
    return this.taskService.updateTask(id, data);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }
}
