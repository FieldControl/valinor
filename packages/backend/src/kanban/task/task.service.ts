import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Task } from 'src/interfaces/task.interface';

@Injectable()
export class TaskService {
  constructor(@Inject('TASK_MODEL') private taskModel: Model<Task>) {}

  async getAllTasks(id: string): Promise<Task[]> {
    return await this.taskModel.find({ _id_project: id }).exec();
  }

  async getByIdTask(projectId: string, taskId: string): Promise<Task> {
    return await this.taskModel
      .findOne({ _id_project: projectId, _id: taskId })
      .exec();
  }

  async createTask(body: Task) {
    const createTask = new this.taskModel(body);
    await createTask.save();
    return this.taskModel.find().exec();
  }

  async renameTask(body: Task): Promise<Task[]> {
    await this.taskModel.updateOne(
      {
        _id: body._id,
        _id_project: body._id_project,
        _id_column: body._id_column,
      },
      { title: body.title },
    );
    return this.taskModel.find().exec();
  }

  async deleteTask(body: Task): Promise<Task[]> {
    await this.taskModel.deleteOne({
      _id: body._id,
      _id_project: body._id_project,
      _id_column: body._id_column,
    });
    return this.taskModel.find().exec();
  }
}
