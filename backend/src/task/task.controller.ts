import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from './task.service.js';
import type { TaskProps } from '../type/taskProps.js';


@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {};

  @Get()
  findAllTask() {
    return this.taskService.findAll();
  }

  @Post()
  create(@Body() body: TaskProps) {
    return this.taskService.create(body);
  }

  @Delete(":id") 
  removeTask(@Param("id") id: string) {
    return this.taskService.removeTask(id)
  }

  @Patch(":id") 
  editarTask(@Param("id") id: string, @Body() body: TaskProps) {
    return this.taskService.editarTask(id, body)
  }
}
