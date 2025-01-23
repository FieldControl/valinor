import { Injectable, HttpException, HttpStatus, Delete, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './card.entity';
import { KanbanColumn } from '../column/column.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(KanbanColumn)
    private columnRepository: Repository<KanbanColumn>,
  ) {}
  

  async createTask(title: string, columnId: number): Promise<Task> {
    
  
    const column = await this.columnRepository.findOne({ where: { id: columnId } });

    if (!column) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
  
    const task = this.taskRepository.create({
      title,
      column,
    });
  
    return await this.taskRepository.save(task);
  }

  async updateTask(id: number, title: string, columnId: number): Promise<Task> {
  const task = await this.taskRepository.findOne({ where: { id }, relations: ['column'] });
  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }

  const column = await this.columnRepository.findOne({ where: { id: columnId } });
  if (!column) {
    throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
  }

  task.title = title;
  task.column = column; 
  return this.taskRepository.save(task);
}

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findAllByColumn(columnId: number): Promise<Task[]> {
    console.log('Trying to find column with id:', columnId);
    const column = await this.columnRepository.findOne({ where: { id: columnId } });
    if (!column) {
      console.log('Column not found');
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }

    return this.taskRepository.find({ where: { column: column } });
  }

  @Delete(':id')
  async deleteTask(id: number): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
  
    if (!task) {
      throw new HttpException(`Task with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
  
    await this.taskRepository.delete(id);
  }
  

  
}
