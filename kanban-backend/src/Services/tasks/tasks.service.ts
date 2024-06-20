import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksDto } from '../../DTO/tasks.dto';
import { Tasks } from '../../Entities/tasks.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tasks)
    private tasksRepository: Repository<Tasks>,
  ) {}

  async createTask(taskDto: TasksDto): Promise<Tasks> {
    const task = new Tasks();
    task.title = taskDto.title;
    task.description = taskDto.description;
    task.columnId = taskDto.columnId;

    return await this.tasksRepository.save(task);
  }

  async updateTask(id: string, taskDto: TasksDto): Promise<Tasks> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new Error('Task not found');
    }

    task.title = taskDto.title;
    task.description = taskDto.description;
    task.columnId = taskDto.columnId;

    return await this.tasksRepository.save(task);
  }

  async findAllTasks(): Promise<Tasks[]> {
    return await this.tasksRepository.find();
  }

  async findOneTask(id: string): Promise<Tasks> {
    return await this.tasksRepository.findOne({ where: { id } });
  }

  async removeTask(id: string): Promise<void> {
    await this.tasksRepository.delete(id);
  }
}
