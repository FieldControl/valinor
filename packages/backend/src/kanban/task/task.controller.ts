import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from 'src/interfaces/task.interface';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getAllTasks(
    @Query('project_id') projectId: string,
    @Query('column_id') columnId: string,
  ): Promise<Task[] | { message: string }> {
    return this.taskService.getAllTasks(projectId, columnId);
  }

  @Get('task/query')
  async getByIdTasks(
    @Query('task_id') taskId: string,
  ): Promise<Task | { message: string }> {
    return this.taskService.getByIdTask(taskId);
  }

  @Post()
  async createTask(@Body() body: Task): Promise<{ message: string }> {
    return this.taskService.createTask(body);
  }

  @Post('archive')
  async archiveTask(
    @Query('task_id') taskId: string,
  ): Promise<{ message: string }> {
    return this.taskService.archiveTask(taskId);
  }

  @Post('recovery')
  async recoveryTask(
    @Query('task_id') taskId: string,
  ): Promise<{ message: string }> {
    return this.taskService.recoveryArchivedTask(taskId);
  }

  @Patch('query')
  async updateTitleTask(
    @Query('task_id') taskId: string,
    @Body() reqBody: Task,
  ): Promise<{ message: string }> {
    return this.taskService.updateTask(taskId, reqBody);
  }

  @Delete('query')
  async deleteTask(@Query('task_id') taskId: string) {
    return this.taskService.archiveTask(taskId);
  }
}
