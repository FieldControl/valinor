import { Injectable } from "@nestjs/common";
import { privateDecrypt } from "crypto";
import { PrismaService } from "./database/prisma.service";
import { Columns, Task } from "./dtos/create-board";


@Injectable()


export class TaskService {

    constructor(private readonly prismaService: PrismaService){
        
    }

    
    private readonly taskArray: Task[] = [];

    

    async getTask(){
        const tasks = await this.prismaService.task.findMany()
        return tasks
            
    }

    
    async createTask(task:Task) {
        const createdTask = await this.prismaService.task.create({
            data: {
                text: task.text,
                columnId: task.columnId
                }
        });
        return createdTask
    }

    async deleteTask(task:Task){
        const deleteTask = await this.prismaService.task.delete({
            where: {
                id: task.id,
                columnId: task.columnId
            }
        });
        return deleteTask
    }
       
}

