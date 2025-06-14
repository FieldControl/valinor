import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './DTO/create-task.dto';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('tasks')
@UseGuards(JwtGuard)
export class TasksController {
    constructor(private readonly taskService: TasksService) { }

    @Post()
    async createTask(@Body(ValidationPipe) model: CreateTaskDto) {
        return this.taskService.createTask(model);
    }

    @Get('column/:columnId')
    async getTasksByColumnId(@Param('columnId') columnId: number) {
        return this.taskService.getTasksByColumnId(columnId);
    }

    @Delete(':taskId')
    async deleteTask(@Param('taskId') taskId: number) {
        return this.taskService.deleteTask(taskId);
    }
}
