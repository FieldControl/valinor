import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskService } from './tasks.service';
import { Task } from './task.entity';

@Controller('task')
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

    @Patch(':id/status')
    async updateStatus(
      @Param('id') id: string,
      @Body() status: { status: string }, 
    ) {
      return await this.taskService.updateTaskStatus(id, status.status);
    }

    @Delete(':id')
    async deleteTask(@Param('id') id: string) {
      return await this.taskService.deleteTask(id);
    }


  @Post()
  create(@Body('title') title: string, @Body('description') description: string): Promise<Task> {
    return this.taskService.createTask(title, description);
  }
}
