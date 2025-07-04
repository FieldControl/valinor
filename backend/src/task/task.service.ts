import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';         
import { UpdateTaskDto } from './dto/update-task.dto';         
import { Task } from './entities/task.entity';                 
import { Repository } from 'typeorm';
import { dot } from 'node:test/reporters';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>
  )
  {

  }
  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.repository.create(createTaskDto);
    return this.repository.save(task);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
     const task = await this.repository.findOneBy({ id });
     if(!task) throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
     return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.repository.findOneBy({ id });
    if(!task) throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    this.repository.merge(task, updateTaskDto);
    return this.repository.save(task);
  }

  async remove(id: number) {
    const task = await this.repository.findOneBy({ id });
    if(!task) throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    return this.repository.remove(task);
  }
}
