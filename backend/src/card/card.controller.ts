import { Controller, Post, Get, Param, Body, HttpException, HttpStatus, Put, Delete } from '@nestjs/common';
import { TaskService } from './card.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() taskData: { title: string, columnId: number }) {
    try {
      return await this.taskService.createTask(taskData.title, taskData.columnId);
    } catch (error) {
      console.error('Error creating task:', error);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.taskService.findAll();
    } catch (error) {
      console.error('Error retrieving tasks:', error);
      throw new HttpException('Error retrieving tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':columnId')
  async findAllByColumn(@Param('columnId') columnId: number) {
    try {
      return await this.taskService.findAllByColumn(columnId);
    } catch (error) {
      console.error('Error retrieving tasks for column:', error);
      throw new HttpException('Error retrieving tasks for column', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put(':id')
async updateTask(@Param('id') id: number, @Body() taskData: { title: string; columnId: number }) {
  try {
    return await this.taskService.updateTask(id, taskData.title, taskData.columnId);
  } catch (error) {
    console.error('Error updating task:', error);
    throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
@Delete(':id')
async deleteTask(@Param('id') id: number) {
  try {
    return await this.taskService.deleteTask(id);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new HttpException(
      error.message || 'Error deleting task',
      error.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
}
