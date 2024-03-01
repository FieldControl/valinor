import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Query,
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
  ): Promise<Task[]> {
    return this.taskService.getAllTasks(projectId, columnId);
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

  @Put('updateTitle')
  async updateTitleTask(@Body() bodyReq: Task) {
    return this.taskService.updateTitleTask(bodyReq);
  }

  @Put('updateDescription')
  async updateDescriptionTask(@Body() bodyReq: Task) {
    return this.taskService.updateDescriptionTask(bodyReq);
  }

  @Put('archive')
  async archiveTask(@Query('task_id') taskId: string) {
    return this.taskService.archiveTask(taskId);
  }

  @Put('recovery')
  async recoveryArchivedTask(@Query('task_id') taskId: string) {
    return this.taskService.recoveryArchivedTask(taskId);
  }

  @Delete('query')
  async deleteTask(@Query('task_id') taskId: string) {
    return this.taskService.archiveTask(taskId);
  }
}
