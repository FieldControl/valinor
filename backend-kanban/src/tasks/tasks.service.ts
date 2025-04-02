import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>
    ){}


    findAll(): Promise<Task[]>{
        return this.tasksRepository.find()
    }

    getTaskById(id: number): Promise<Task | null>{
        return this.tasksRepository.findOne({where: {id}})
    }

    async addTask(taskData: Partial<Task>): Promise<Task>{
        const newTask = this.tasksRepository.create(taskData)

        return this.tasksRepository.save(newTask)
    }

    async updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
        await this.tasksRepository.update(id, taskData)

        return this.getTaskById(id)
    }

    async deleteTask(id: number): Promise<void>{
        await this.tasksRepository.delete(id)
    }
}
