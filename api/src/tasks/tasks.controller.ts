import { Body, Controller, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './DTO/create-task.dto';

@Controller('tasks')
export class TasksController {
    private readonly _taskService: TasksService;
    constructor(taskService: TasksService) {
        this._taskService = taskService;
    }

    @Post()
    async createTask(@Body() model: CreateTaskDto) {
        return this._taskService.createTask(model);
    }
}
