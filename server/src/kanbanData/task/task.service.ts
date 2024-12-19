import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './task.schema';
import { CreateTaskInput } from './create-task.input';
import { TaskType } from './task.type';
import { SubtaskService } from '../subtask/subtask.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private subtaskService: SubtaskService,
  ) {}

  // Criando a task
  async create(createTaskInput: CreateTaskInput): Promise<Task> {
    const createdTask = new this.taskModel(createTaskInput);
    const savedTask = await createdTask.save();
    return savedTask;
  }

  // Encontrando todas as tasks
  async findByStatus(status: string): Promise<TaskType[]> {
    const tasks = await this.taskModel.find({ status }).exec(); // Filtrando as tasks pelo campo status
    return tasks.map((task) => ({
      id: task._id.toString(),
      name: task.name,
      description: task.description,
      status: task.status,
    }));
  }

  // Função para deletar uma task específica e suas subtasks associadas
  async removeTaskAndSubtasks(id: string): Promise<boolean> {
    // Deletando as subtasks associadas à task
    const subtasksRemoved = await this.subtaskService.removeManyByTaskIds(id);

    // Deletando a task em si
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    return result != null; // Retorna true se a task foi deletada com sucesso
  }

  // Deletando as tasks das coluna
  async removeMany(status: string): Promise<boolean> {
    // Deletando as tasks associadas ao status
    const tasksToDelete = await this.taskModel.find({ status }).exec();
    const taskIds = tasksToDelete.map((task) => task._id); // Coletando os IDs das tasks deletadas

    // Deletando as subtasks associadas às tasks deletadas
    await this.subtaskService.removeManyByTaskIds(taskIds);

    const result = await this.taskModel.deleteMany({ status: status }).exec();
    return result.deletedCount > 0; // Retorna quantas tasks foram deletadas
  }

  // Atualizar uma task
  async update(id: string, newStatus: string): Promise<boolean> {

    const result = await this.taskModel.updateOne(
      { _id: id }, // Encontrar a task pelo ID
      { $set: { status: newStatus } }, // Atualizar o campo `status` da task
    );

    return result.modifiedCount > 0; // Retorna true se a task foi atualizada
  }

  // Atualizar o nome da task
  async updateName(id: string, newName: string): Promise<boolean> {
    const result = await this.taskModel.updateOne(
      { _id: id }, // Encontrar a task pelo ID
      { $set: { name: newName } }, // Atualizar o campo `name` da task
    );
    return result.modifiedCount > 0; // Retorna true se a task foi atualizada
  }

  // Atualizar o status da task
  async updateStatus(id: string, newStatus: string): Promise<boolean> {
    const result = await this.taskModel.updateOne(
      { _id: id }, // Encontrar a task pelo ID
      { $set: { status: newStatus } }, // Atualizar o campo `status` da task
    );
    return result.modifiedCount > 0; // Retorna true se a task foi atualizada
  }

  // Atualizar a descrição da task
  async updateDescription(
    id: string,
    newDescription: string,
  ): Promise<boolean> {
    const result = await this.taskModel.updateOne(
      { _id: id }, // Encontrar a task pelo ID
      { $set: { description: newDescription } }, // Atualizar o campo `description` da task
    );
    return result.modifiedCount > 0; // Retorna true se a task foi atualizada
  }
}
