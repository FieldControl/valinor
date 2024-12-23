import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { Observable } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async updateTaskStatus(id: string, status: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (task) {
      task.status = status;
      await this.taskRepository.save(task); 
      return task;
    } else {
      throw new Error('Tarefa não encontrada');
    }
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const task = await this.taskRepository.findOne({ where: { id } });
  
    if (!task) {
      throw new Error('Task not found');
    }
  
    await this.taskRepository.delete(id);
    return { message: 'Task deleted successfully' };
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async createTask(title: string, description: string): Promise<Task> {
    const task = this.taskRepository.create({ title, description });
    return this.taskRepository.save(task);
  }
}
