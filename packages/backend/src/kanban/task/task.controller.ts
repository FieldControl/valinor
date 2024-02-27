import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Task } from 'src/interfaces/task.interface';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getAllTasks(@Query('project_id') id: string): Promise<Task[]> {
    return this.taskService.getAllTasks(id);
  }

  @Get('query')
  async getByIdTasks(
    @Query('project_id') projectId: string,
    @Query('task_id') taskId: string,
  ): Promise<Task> {
    return this.taskService.getByIdTask(projectId, taskId);
  }

  @Post()
  async createTask(@Body() body: Task): Promise<Task[]> {
    return this.taskService.createTask(body);
  }
}
