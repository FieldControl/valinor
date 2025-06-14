import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './DTO/create-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
    ) { }

    async createTask(model: CreateTaskDto) {
        const task = this.taskRepository.create(model);
        return this.taskRepository.save(task);
    }

    async getTasksByColumnId(columnId: number) {
        return this.taskRepository.find({ where: { columnId } });
    }
}
