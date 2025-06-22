import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()// Cria uma nova task
    // e retorna a task criada
    async create(@Body() task: Partial<Task>): Promise<Task> {
        return this.taskService.create(task);
    }
    @Get()// Retorna todas as tasks
    // e retorna uma lista de tasks
    async findAll(): Promise<Task[]> {
        return this.taskService.findAll();
    }

    // Retorna uma task pelo id
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Task> {
        return this.taskService.findOne(+id);
    }
    @Patch(':id')// Atualiza uma task pelo id   
    async update(@Param('id') id: number, @Body() data: Partial<Task>): Promise<Task> {
        return this.taskService.update(id, data);
    }
    @Delete(':id')// Remove uma task pelo id
    // e não retorna nada
    async remove(@Param('id') id: number): Promise<void> {
        return this.taskService.remove(id);
    }

    
}
