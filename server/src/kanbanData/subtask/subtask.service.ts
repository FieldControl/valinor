import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subtask } from './subtask.schema';
import { CreateSubtaskInput } from './create-subtask.input';
import { SubtaskType } from './subtask.type';

@Injectable()
export class SubtaskService {
  constructor(
    @InjectModel(Subtask.name) private subtaskModel: Model<Subtask>,
  ) {}

  // Criando uma nova subtask
  async create(createSubtaskInput: CreateSubtaskInput): Promise<Subtask> {
    const createdSubtask = new this.subtaskModel(createSubtaskInput);
    const savedSubtask = await createdSubtask.save();
    return savedSubtask;
  }

  async findByTask(task: string): Promise<SubtaskType[]> {
    const subtasks = await this.subtaskModel.find({ task }).exec(); // Filtrando as tasks pelo campo status
    return subtasks.map((subtask) => ({
      id: subtask._id.toString(),
      isCompleted: subtask.isCompleted,
      name: subtask.name,
      task: subtask.task,
    }));
  }

  // Deletar uma subtask
  async remove(id: string): Promise<boolean> {
    const result = await this.subtaskModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Deletando as subtasks da task
  async removeManyByTaskIds(taskIds: any): Promise<boolean> {
    const result = await this.subtaskModel
      .deleteMany({ task: { $in: taskIds } })
      .exec();
    return result.deletedCount > 0; // Retorna quantas subtasks foram deletadas
  }

  // Atualizar uma subtask
  async update(id: string, isCompleted: boolean): Promise<boolean> {

    // Buscando a subtask pela ID e atualizando o campo `isCompleted`
    const result = await this.subtaskModel.updateOne(
      { _id: id }, // Encontrar a subtask pelo ID
      { $set: { isCompleted: isCompleted } }, // Atualizar o campo `isCompleted`
    );
    return result.modifiedCount > 0; // Retorna se a subtask foi atualizada
  }
}
