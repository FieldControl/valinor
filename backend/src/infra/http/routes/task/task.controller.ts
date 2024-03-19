import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from '@prisma/client';
import { JwtAuthGuard } from 'src/infra/auth/jwt-auth.guard';

interface TaskRequest {
  title: string;
  description: string;
  archived: boolean;
  columnId: string;
  projectId: string;
}

interface TaskResponse {
  task: Omit<Task, 'projectId' | 'columnId'>;
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getByIds(@Query('columnId') columnId: string): Promise<Task[]> {
    return this.taskService.getTaskByProjectAndColumnIds(columnId);
  }

  @Get(':id')
  async getByTask(@Param('id') id: string): Promise<Task | null> {
    return this.taskService.getTaskById(id);
  }

  @Get()
  async getAll(): Promise<Task[]> {
    return this.taskService.getAllTasks();
  }

  @Post()
  async create(
    @Body()
    { title, description, archived, columnId, projectId }: TaskRequest,
  ): Promise<TaskResponse> {
    const task = await this.taskService.createTask({
      title,
      description,
      archived,
      columnId,
      projectId,
    });

    return { task };
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    await this.taskService.deleteTaskById(id);
    return { message: 'Task deletada com sucesso' };
  }

  @Patch(':id')
  async updateTask(@Param('id') id: string, @Body() data: TaskRequest) {
    return this.taskService.updateTaskById(id, data);
  }
}
