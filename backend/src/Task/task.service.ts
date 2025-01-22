import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(task: Partial<Task>): Promise<Task> {
    const newTask = this.taskRepository.create(task);
    return await this.taskRepository.save(newTask);
  }

  async update(id: number, task: Partial<Task>): Promise<Task> {
    await this.taskRepository.update(id, task);
    return this.taskRepository.findOneOrFail({ where: { id } }); 
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: number): Promise<Task> {
    try {
      return await this.taskRepository.findOneOrFail({ where: { id } });  
    } catch (error) {
      throw new Error(`Task with id ${id} not found`); 
    }
  }

  async remove(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
