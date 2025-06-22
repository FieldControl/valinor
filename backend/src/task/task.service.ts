import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task.entity'; 

@Injectable()// Serviço responsável por gerenciar as operações relacionadas às tasks
// Importante: Certifique-se de que o TypeORM e o NestJS estejam configurados corretamente no seu projeto
// para que este serviço funcione como esperado.
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}// Injeta o repositório de Task para realizar operações no banco de dados

  
  create(task: Partial<Task>): Promise<Task> {// Cria uma nova task e a salva no banco de dados
    const newTask = this.taskRepository.create(task);
    return this.taskRepository.save(newTask);
  }

  
  findAll(): Promise<Task[]> {// Retorna todas as tasks
    return this.taskRepository.find();
  }

  
  async findOne(id: number): Promise<Task> {// Retorna uma task pelo id
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task com id ${id} não encontrada`);
    }
    return task;
  }

  // Atualiza uma task pelo id e retorna a task atualizada
  // Se o status for DONE, marca a tarefa como concluída; se for OPEN ou IN_PROGRESS, marca como não concluída  
  async update(id: number, data: Partial<Task>): Promise<Task> {
    if ( data.status)
      if(data.status === TaskStatus.DONE){
        data.completed = true;
      }else if(data.status === TaskStatus.OPEN || data.status === TaskStatus.IN_PROGRESS){
        data.completed = false;
      }

    await this.taskRepository.update(id, data);
    return this.findOne(id);
  }// Atualiza uma task pelo id e retorna a task atualizada

  
  async remove(id: number): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task com id ${id} não encontrada`);
    }// Remove uma task pelo id e lança uma exceção se não encontrar a task
  }
}

