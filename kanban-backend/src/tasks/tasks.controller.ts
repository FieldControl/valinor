import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.model';

// Controlador para lidar com as requisições relacionadas às tarefas
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Rota para buscar todas as tarefas
  @Get()
  async getAllTasks(): Promise<Task[]> {
    return this.tasksService.getAllTasks();
  }

  // Rota para criar uma nova tarefa
  @Post()
  async createTask(@Body('description') description: string): Promise<Task> {
    return this.tasksService.createTask(description);
  }

  // Rota para excluir uma tarefa por ID
  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<Task> {
    return this.tasksService.deleteTask(id);
  }

  // Rota para atualizar uma tarefa por ID
  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body('description') description: string
  ): Promise<Task> {
    return this.tasksService.updateTask(id, description);
  }
}
