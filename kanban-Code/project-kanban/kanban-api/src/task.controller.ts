import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { TaskService } from "./task.service";
import { Columns, Task } from "./dtos/create-board";
import { create } from "domain";
import { Column } from "@prisma/client";
import { text } from "stream/consumers";


@Controller("/task")
    

export class TaskController{
    
    constructor(private readonly taskService: TaskService) {}
    
    

    @Get()
    async getTask(){
        const task = await this.taskService.getTask()
        return task
    }

    @Post()
    async createTask(@Body() tasks: Task){
        const newTask = await this.taskService.createTask(tasks)
        return newTask
    
    }    
    
    @Delete()
    async deleteTask(@Body() tasks: Task){
        const deleteTask = await this.taskService.deleteTask(tasks)
        return deleteTask;
    }    

    
}
