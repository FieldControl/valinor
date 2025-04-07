import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async onModuleInit() {
    const tasks = await this.taskRepository.find();
    if (tasks.length === 0) {
      console.log('Inserindo dados de teste...');
      await this.taskRepository.save([
        { name: 'Tarefa 1', column: 'A Fazer', comments: [] },
        { name: 'Tarefa 2', column: 'Em Progresso', comments: [] },
        { name: 'Tarefa 3', column: 'Concluído', comments: [] },
      ]);
      console.log('Dados de teste inseridos.');
    }
  }
}
