import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TasksController {

    constructor(private taskService: TasksService){}

    @Get()
    findAll(){
        return this.taskService.findAll()
    }

    @Get(':id')
    getTaskById(@Param('id', ParseIntPipe) id:number){
        return this.taskService.getTaskById(id)
    }

    @Post()
    async addTask(@Body() taskData: any): Promise<Task>{
        if(!taskData.title || taskData.title.trim() ===''){
            throw new BadRequestException('Title is required')
        }
        if(!taskData.description || taskData.description.trim() ===''){
            throw new BadRequestException('description is required')
        }
        if(!taskData.responsavel || taskData.responsavel.trim() ===''){
            throw new BadRequestException('responsavel is required')
        }
        if(!taskData.status || !['to-do', 'in-progress', 'done'].includes(taskData.status)){
            throw new BadRequestException('invalid sstatus')
        }

        return this.taskService.addTask(taskData)
    }

    @Delete(':id')
    deleteTask(@Param('id') id:number){
        return this.taskService.deleteTask(id)
    }

    @Put(':id')
    updateTask(@Param('id') id: number, @Body() taskData: Task){
        const updatedTask = this.taskService.updateTask(Number(id), taskData)

        console.log(updatedTask)
        if(!updatedTask){
            throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND)
        }

        return updatedTask
    }

}
