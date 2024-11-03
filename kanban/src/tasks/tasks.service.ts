import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>){}
  async create(createTaskDto: CreateTaskDto) {
    return await this.taskRepository.insert(createTaskDto);
  }

  async findAll() {
    return await this.taskRepository.find({where:{status:1},loadRelationIds: true});
  }

  async findOne(id: number) {
    return await this.taskRepository.findOne({where:{id:id, status:1}, loadRelationIds: true});
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return await this.taskRepository.update(id,updateTaskDto);
  }

  async remove(id: number) {
    return await this.taskRepository.update(id,{status: 0});
  }
}
