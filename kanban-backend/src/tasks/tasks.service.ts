// tasks.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './task.model';

// Serviço para lidar com as operações CRUD das tarefas
@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  // Busca todas as tarefas
  async getAllTasks(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  // Cria uma nova tarefa com a descrição fornecida
  async createTask(description: string): Promise<Task> {
    const newTask = new this.taskModel({ description });
    return newTask.save();
  }

  // Deleta uma tarefa com o ID fornecido
  async deleteTask(id: string): Promise<Task> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  // Atualiza uma tarefa com o ID fornecido e a nova descrição
  async updateTask(id: string, description: string): Promise<Task> {
    return this.taskModel.findByIdAndUpdate(id, { description }, { new: true }).exec();
  }
}
