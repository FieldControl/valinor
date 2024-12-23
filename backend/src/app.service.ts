import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks/task.entity';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(task: Task): Promise<Task> {
    const novaTarefa = this.taskRepository.create(task); 
    return this.taskRepository.save(novaTarefa);
  }

  async getAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }
}
