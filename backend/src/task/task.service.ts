import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { TaskProps } from '../type/taskProps.js';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.task.findMany();
    }

    async create(body: TaskProps) {
        const createTask = await this.prisma.task.create({
            data: {
                name: body.name,
                description: body.description,
          
            },
        });

        return createTask;
    }   

    async removeTask(id: string) {
        const removeTask = await this.prisma.task.delete({
            where: {
                id: id
            }
        })

        return removeTask
    }

    async editarTask(id: string, body: TaskProps) {
        const taskAtu = await this.prisma.task.update({
            where: {
                id: id
            },
            data: {
                ...body
            }
        })
        return taskAtu
       
    }
}
