import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { ParseIntPipe } from '@nestjs/common';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Post()
  create(@Body() task: Partial<Task>): Promise<Task> {
    return this.taskService.create(task);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() task: Partial<Task>): Promise<Task> {
    return this.taskService.update(id, task);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.taskService.delete(id);
  }
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) taskId: number,
    @Body('content') content: string,
  ) {
    return this.taskService.addComment(taskId, content);
  }

  @Put(':id/comments/:commentId')
  async editComment(
    @Param('id', ParseIntPipe) taskId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('content') newContent: string,
  ) {
    return this.taskService.editComment(taskId, commentId, newContent);
  }
}
